import ModalComponent from "../components/ModalComponent";
const InputComponent = ({
  open,
  setOpen,
  canvasContexts,
  setHeight,
  setWidth,
  url,
  setShowDownloads,
  setUrl,
}) => {
  return (
    <>
      {open && (
        <ModalComponent
          setOpen={setOpen}
          canvasContexts={canvasContexts}
          setHeight={setHeight}
          setWidth={setWidth}
          url={url}
          setShowDownloads={setShowDownloads}
          setUrl={setUrl}
        />
      )}
      <button
        type="button"
        className="hover:bg-blue-700 text-white font-bold py-2 px-4 rounded drop-shadow-lg bg-blue"
          onClick={() => setOpen(true)}
      >
        Choose Image
      </button>
    </>
  );
};

export default InputComponent;
