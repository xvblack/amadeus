export const PanelWrap = ({
  width,
  index,
  children,
}: {
  width: number;
  index: number;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="sticky shrink-0 grow-0 overflow-y-auto shadow-lg bg-white"
      style={{ left: `${40 * index}px`, width: `${width}px` }}
    >
      {children}
    </div>
  );
};

export const PanelContainer = ({
  children,
  width,
}: {
  children: React.ReactNode;
  width: number;
}) => {
  return (
    <div className="flex flex-row h-screen">
      <div className="flex flex-row h-screen" style={{ width: `${width}px` }}>
        {children}
      </div>
    </div>
  );
};
