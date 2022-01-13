import { createRef, useState } from "react";

function Tooltip({ children, tooltipText, isHidden }) {
  const tipRef = createRef(null);
  return (
    <div className="relative flex items-center">
      {!isHidden &&
      <div
        className={` absolute z-40 ${
          tooltipText.length < 12 ? "whitespace-nowrap" : "whitespace-normal"
        } bg-black text-white px-4 py-2 rounded flex items-center transition-all duration-150`}
        style={{ left: "0%", bottom: "50%" }}
        ref={tipRef}
      >
        {tooltipText}
      </div>}
      {children}
    </div>
  );
}
export default Tooltip;
