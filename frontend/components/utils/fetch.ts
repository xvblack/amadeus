export type FetchResponse<T> =
  | {
      data: T;
      error?: undefined;
    }
  | {
      data?: undefined;
      error: any;
    };

export const typedFetch = async <T>({
  method,
  path,
  query,
  body,
}: {
  method: string;
  path: string;
  query?: Record<string, string | undefined>;
  body?: Record<string, any>;
}): Promise<FetchResponse<T>> => {
  const url = query
    ? `${path}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(query).filter(([k, v]) => v !== undefined) as [
            string,
            string
          ][]
        )
      ).toString()}`
    : path;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body && JSON.stringify(body),
      cache: "no-store",
    });

    if (response.ok) {
      const result = await response.json();
      return {
        data: result as T,
      };
    }
    return {
      error: {
        url: url,
        errorMessage: await response.text(),
      },
    };
  } catch (exception) {
    return {
      error: {
        url: url,
        exception,
      },
    };
  }
};
