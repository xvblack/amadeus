"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Hit, QueryState, queryStateInit } from "./schema";
import { atomWithLocation } from "jotai-location";
import { atomWithQuery } from "jotai-tanstack-query";
import { atom } from "jotai/vanilla";
import { useAtomValue, useSetAtom } from "jotai/react";
import { chatStateAtom, OperatingMode } from "../../components/chat/chat";
import { ChatBox } from "../../components/chat/box";

const locationAtom = atomWithLocation();
const rawStateAtom = atom<QueryState>(queryStateInit);
const getQueryAtom = atom<QueryState>((get) => {
  const raw = get(rawStateAtom);
  const query = get(locationAtom).searchParams;
  if (raw.init) {
    return raw;
  } else {
    return {
      ...raw,
      init: true,
      query: (query?.get("query") as string) || "",
      currentPage: parseInt((query?.get("currentPage") as string) || "1"),
      itemsPerPage: parseInt((query?.get("itemsPerPage") as string) || "20"),
    } as QueryState;
  }
});
type UpdateQuery =
  | {
      action: "changeItemsPerPage";
      itemsPerPage: number;
    }
  | {
      action: "changeQuery";
      query: string;
    }
  | {
      action: "paginate";
      page?: number;
      diff?: number;
    }
  | {
      action: "switchTitleOnly";
    }
  | {
      action: "addTag";
      tag: string;
    };

const updateQueryAtom = atom(null, async (get, set, update: UpdateQuery) => {
  const curr = {
    ...get(getQueryAtom),
  };
  if (update.action == "changeItemsPerPage") {
    curr.itemsPerPage = update.itemsPerPage;
  } else if (update.action == "changeQuery") {
    curr.query = update.query;
    curr.currentPage = 1;
  } else if (update.action == "paginate") {
    if (update.page) {
      curr.currentPage = update.page;
    } else if (update.diff) {
      const newPage = curr.currentPage + update.diff;
      const {data: queryResult, isPending, isError} = useAtomValue(queryResultAtom);
      if (isPending || isError) {
        return;
      }
      const numPages = queryResult.numPages;
      if (newPage >= 1 && newPage <= numPages) {
        curr.currentPage = newPage;
      }
    }
  } else if (update.action == "switchTitleOnly") {
    curr.titleOnly = !curr.titleOnly;
  } else if (update.action == "addTag") {
    if (curr.tags.indexOf(update.tag) == -1) {
      curr.tags.push(update.tag);
    }
  }
  set(rawStateAtom, curr);
  set(locationAtom, (location) => {
    return {
      pathname: location.pathname,
      searchParams: new URLSearchParams({
        query: curr.query,
        currentPage: curr.currentPage.toString(),
        itemsPerPage: curr.itemsPerPage.toString(),
      }),
    };
  });
  // set(locationAtom, (location) => {});
});

const fetcher = (params: any) =>
  fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  }).then((res) => res.json());

const queryResultAtom = atomWithQuery((get) => ({
  keepPreviousData: true,
  queryKey: ["search", get(getQueryAtom)] as [string, QueryState],
  queryFn: async ({
    queryKey: [, queryState],
  }: {
    queryKey: [string, QueryState];
  }) => {
    console.log("Searching");
    const query = toQuery(queryState);
    const response = await fetcher(query);

    console.log("Response", response);
    return {
      requestTimestamp: Date.now(),
      hits: response.hits?.map((hit: any) => ({
        ...hit.document,
        highlights: hit.highlights,
      })) as Hit[],
      numPages: Math.ceil(response.found / queryState.itemsPerPage),
    };
  },
}));

const colorMapping = {
  "pocket:unread": "bg-red-200",
  twitter: "bg-blue-200",
} as Record<string, string>;

const TagStyled = ({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) => {
  return (
    <span
      className={`text-xs inline-flex items-center font-bold leading-sm uppercase px-1.5 py-0.5 ${color} rounded-full`}
    >
      {children}
    </span>
  );
};

const Tag = ({ tag }: { tag: string }) => {
  const color = colorMapping[tag] || "bg-green-200";
  const updateQuery = useSetAtom(updateQueryAtom);

  return (
    <TagStyled color={color}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          updateQuery({
            action: "addTag",
            tag,
          });
        }}
      >
        {tag}
      </a>
    </TagStyled>
  );
};

const LinkToDetail = ({ id }: { id: number }) => {
  return (
    <TagStyled color="bg-transparent">
      <a href={`/search/details/${id}`} target="_blank" rel="noreferrer">
        Details
      </a>
    </TagStyled>
  );
};

const MarkAsRead = ({ url, pocketId }: { url: string; pocketId: string }) => {
  const mutate = useSetAtom(queryResultAtom);
  const markAsRead = useCallback(async () => {
    if (pocketId) {
      await fetch("/api/pocket/pocket-mark-as-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          pocket_id: pocketId,
        }),
      });
      mutate();
    }
  }, [mutate, pocketId, url]);
  return (
    <TagStyled color="bg-transparent">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          markAsRead();
        }}
      >
        Pocket:Mark_As_Read
      </a>
    </TagStyled>
  );
};

const MyHit = ({ titleOnly, hit }: { titleOnly: boolean; hit: Hit }) => {
  const pocketId = hit.attrs?.pocket_id;
  const shouldShowMarkAsRead =
    pocketId && hit.tags.indexOf("pocket:unread") >= 0;
  const shouldShowHighlight = hit.highlights && hit.highlights.length > 0;

  return (
    <div
      onClick={() => {}}
      className="block py-2 px-4 bg-white border border-gray-200 shadow-md hover:bg-gray-100"
    >
      <h5 className="mb-1 text-ellipsis line-clamp-1 text-base font-bold tracking-tight text-gray-900">
        <a href={hit.url} target="_blank" rel="noreferrer">
          {hit.title || hit.url}
        </a>
      </h5>
      {/* <p className="text-sm text-ellipsis line-clamp-1 font-normal text-gray-500"> */}
      <p className="text-sm font-normal text-gray-500 break-all">
        Added {new Date(hit.time_added * 1000).toLocaleDateString(["zh-CN"])}{" "}
        {hit.url}
        {hit.tags.map((tag) => (
          <Tag key={tag} tag={tag}></Tag>
        ))}
        <LinkToDetail id={hit.id!}></LinkToDetail>
        {shouldShowMarkAsRead && (
          <MarkAsRead url={hit.url} pocketId={pocketId}></MarkAsRead>
        )}
      </p>
      {shouldShowHighlight && (
        <div>
          <p className="font-normal text-gray-700 line-clamp-3">
            {hit.highlights[0].snippet}
          </p>
        </div>
      )}
      {!titleOnly && (
        <div>
          <p className="font-normal text-gray-700 line-clamp-3">
            {hit.abstract}
          </p>
        </div>
      )}
    </div>
  );
};

const MyHits = () => {
  const queryState = useAtomValue(getQueryAtom);
  const {status, data} = useAtomValue(queryResultAtom);
  return (
    <div>
      {data?.hits.map((hit) => (
        <MyHit key={hit.id} hit={hit} titleOnly={queryState.titleOnly}></MyHit>
      ))}
    </div>
  );
};

const useSearchBox = () => {
  const queryState = useAtomValue(getQueryAtom);
  const updateQuery = useSetAtom(updateQueryAtom);

  return {
    query: queryState.query,
    refine: (newQuery: string) => {
      updateQuery({
        action: "changeQuery",
        query: newQuery,
      });
    },
  };
};

const SearchBox = () => {
  const { query, refine } = useSearchBox();
  const [value, setValue] = useState(query);

  return (
    <div>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          refine(e.target.value);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      ></input>
    </div>
  );
};

const useHitsPerPage = () => {
  const queryState = useAtomValue(getQueryAtom);
  const updateQuery = useSetAtom(updateQueryAtom);
  return {
    itemsPerPage: queryState.itemsPerPage,
    refine: (itemsPerPage: any) => {
      updateQuery({
        action: "changeItemsPerPage",
        itemsPerPage,
      });
    },
  };
};

const ChoosePageSize = () => {
  const items = [
    { label: "P6", value: 6 },
    { label: "P20", value: 20, default: true },
    { label: "P50", value: 50 },
    { label: "P100", value: 100 },
  ];
  const { itemsPerPage, refine } = useHitsPerPage();

  return (
    <select
      value={itemsPerPage}
      onChange={(e) => {
        refine(parseInt(e.target.value));
      }}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
};

const usePagination = () => {
  const queryState = useAtomValue(getQueryAtom);
  const updateQuery = useSetAtom(updateQueryAtom);
  const {data: queryResult, isPending, isError} = useAtomValue(queryResultAtom);
  const pages = [];
  for (
    let i = Math.max(1, queryState.currentPage - 3);
    i <= Math.min(queryResult.numPages, queryState.currentPage + 3);
    i++
  ) {
    pages.push(i);
  }
  return {
    pages,
    nbPages: queryResult.numPages,
    refine: (newPage: number) => {
      console.log("Updating page", newPage);
      updateQuery({
        action: "paginate",
        page: newPage,
      });
    },
    currentRefinement: queryState.currentPage,
  };
};

const Pagination = () => {
  const { pages, refine, currentRefinement } = usePagination();

  return (
    <>
      <div>
        <a href="#" onClick={() => refine(currentRefinement - 1)}>
          &lt;
        </a>
      </div>
      {pages.map((page) => (
        <div key={page}>
          <a href="#" onClick={() => refine(page)}>
            {page === currentRefinement ? <u>{page}</u> : page}
          </a>
        </div>
      ))}
      <div>
        <a href="#" onClick={() => refine(currentRefinement + 1)}>
          &gt;
        </a>
      </div>
    </>
  );
};

const UnderlineIf = (cond: boolean, elem: string) => {
  if (cond) {
    return <u>{elem}</u>;
  } else {
    return elem;
  }
};

const toQuery = (queryState: QueryState) => {
  const query = queryState.query;
  const filterBy = queryState.tags
    ? queryState.tags.map((tag) => `tags:${tag}`).join(",")
    : "";

  return {
    q: query,
    filter_by: filterBy,
    query_by: "title,url,abstract,content,tags",
    sort_by: "time_added:desc",
    facet_by: "tags",
    page: queryState.currentPage,
    per_page: queryState.itemsPerPage,
  };
};

const Toggles = () => {
  const queryState = useAtomValue(getQueryAtom);
  const updateQuery = useSetAtom(updateQueryAtom);

  return (
    <div>
      <a
        href="#"
        onClick={() => {
          updateQuery({
            action: "switchTitleOnly",
          });
        }}
      >
        {UnderlineIf(queryState.titleOnly, "T")}
      </a>{" "}
    </div>
  );
};

const useKeyboardControl = () => {
  const updateQuery = useSetAtom(updateQueryAtom);

  const callback = useCallback(
    (e: KeyboardEvent) => {
      if (e.key == "ArrowLeft") {
        updateQuery({
          action: "paginate",
          diff: -1,
        });
      } else if (e.key == "ArrowRight") {
        updateQuery({
          action: "paginate",
          diff: 1,
        });
      } else if (e.key == "t") {
        updateQuery({
          action: "switchTitleOnly",
        });
      }
    },
    [updateQuery]
  );
  useEffect(() => {
    window.addEventListener("keydown", callback);

    return () => {
      window.removeEventListener("keydown", callback);
    };
  }, [callback]);
};

const SummarizeChat = () => {
  const {data: queryResult, isPending, isError} = useAtomValue(queryResultAtom);
  return "Deprecated";
  // if (isPending) {
  //   return <div>Loading...</div>;
  // }
  // if (isError) {
  //   return <div>Error</div>;
  // }
  // const hits = queryResult.hits;
  // const searchResultAtom = useMemo(
  //   () =>
  //     atom({
  //       raw: `The user is browsing a list of web pages representing by their titles. You shall first respond with a summary tagging the pages into different categories. Output in markdown format.
  //       The pages are:
  //       ${hits.map((hit) => hit.title!.slice(0, 100)).join("\n")}`,
  //     }),
  //   [hits]
  // );
  // const chatState = chatStateAtom({
  //   character: "summarizer",
  //   dependentCharacters: [],
  //   operatingMode: OperatingMode.ASSISTANT_FIRST,
  //   initialPrompt: searchResultAtom,
  //   hideSystemPrompt: true,
  // });

  // // return <div>SUMMARIZE ON</div>;
  // return <div>{<ChatBox chatAtom={chatState}></ChatBox>}</div>;
};

const summarizeAtom = atom(false);

const Summarizer = () => {
  const summarizeOn = useAtomValue(summarizeAtom);

  return <div>{summarizeOn && <SummarizeChat />}</div>;
};

const ToggleSummarize = () => {
  const setSummarizeOn = useSetAtom(summarizeAtom);

  return (
    <button
      onClick={() => {
        setSummarizeOn((old) => !old);
      }}
    >
      SUM
    </button>
  );
};

// const Refresh = () => {
//   const mutate = useSetAtom(queryResultAtom);
//   return (
//     <>
//       <button
//         onClick={async () => {
//           await fetch("/api/pocket/sync-pocket", {
//             method: "POST",
//             headers: {
//               "Context-Type": "application/json",
//             },
//             body: JSON.stringify({
//               limit: 500,
//             }),
//           });
//           mutate({
//             type: "refetch",
//           });
//         }}
//       >
//         SYNC
//       </button>
//     </>
//   );
// };

export const Search = () => {
  useKeyboardControl();

  return (
    <div className="flex flex-row container w-screen md:mx-auto md:w-2xl">
      {/* <div>
        <ul>
          <li>OVERVIEW</li>
          <li>AGI</li>
        </ul>
      </div> */}
      <div>
        <div className="flex flex-row flex-wrap gap-4">
          <SearchBox />
          <Pagination />
          <ChoosePageSize />
          <Toggles />
          {/* <Refresh /> */}
          <ToggleSummarize />
        </div>
        <div className="md:overflow-x-clip">
          <Summarizer />
          <MyHits />
        </div>
      </div>
    </div>
  );
};

export default Search;
