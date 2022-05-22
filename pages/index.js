import NavbarComponent from "../components/NavbarComponent";
import TitleComponent from "../components/TitleComponent";
import { useState, useEffect } from "react";
import Sidebar from "../components/SidebarComponent";
import ImageDisplay from "../components/ImageDisplayComponent";
import { setEventListeners } from "../services/setEventListeners";
import AnnouncementComponent from "../components/Announcement";
import default_tags from "../services/landing_tags";

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    if (typeof window !== "undefined") {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Call handler right away so state gets updated with initial window size
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export default function Main() {
  const [inputURI, setInputURI] = useState("./images/senjougahara.png");
  const [outputURI, setOutputURI] = useState("./images/senjougahara_2x.png");
  const [previewURI, setPreviewURI] = useState("/images/senjougahara.png");
  const [loading, setLoading] = useState(false);
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [tags, setTags] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [extension, setExtension] = useState("png");
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  const [userHasRun, setUserHasRun] = useState(false);
  const [fileName, _setFileName] = useState("example");
  const [modelLoading, setModelLoading] = useState(false);
  const [mobile, setMobile] = useState(false);

  const size = useWindowSize();

  useEffect(() => {
    setMobile(size.width / size.height < 1.0);
  }, [size]);

  var lastFileName = fileName;

  function setFileName(name = null) {
    if (name == null) {
      name = lastFileName;
    } else {
      lastFileName = name;
    }
    _setFileName(`${name}_${upscaleFactor}x`);
  }

  useEffect(async () => {
    setInputURI("./images/senjougahara.png");
    setOutputURI("./images/senjougahara_2x.png");
    setTags(default_tags);
    setEventListeners(
      setPreviewURI,
      setFileName,
      setShowSidebar,
      setInputModalOpen
    );
  }, []);

  return (
    <>
      <div
        style={{
          backgroundImage: `url("images/bg.svg")`,
          backgroundSize: "cover",
          backgroundPositionX: "right",
        }}
      >
        <Sidebar
          inputModalOpen={inputModalOpen}
          setInputModalOpen={setInputModalOpen}
          setInputURI={setInputURI}
          setOutputURI={setOutputURI}
          inputURI={inputURI}
          previewURI={previewURI}
          setPreviewURI={setPreviewURI}
          setFileName={setFileName}
          setTags={setTags}
          outputURI={outputURI}
          fileName={fileName}
          extension={extension}
          setLoading={setLoading}
          loading={loading}
          setExtension={setExtension}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          tags={tags}
          setUserHasRun={setUserHasRun}
          upscaleFactor={upscaleFactor}
          setUpscaleFactor={setUpscaleFactor}
          modelLoading={modelLoading}
          setModelLoading={setModelLoading}
        />
        {/* Image display, title, navbar */}
        <main className="flex-1">
          <AnnouncementComponent
            announcement={
              "Safari performance will be worse than other browsers. If possible use a non-webkit based browser."
            }
            mobile={mobile}
          />

          <div className="flex flex-col items-center h-screen w-screen relative">
            <NavbarComponent currentPage="index" />

            <div className={`h-3/4 grow w-full`}>
              <ImageDisplay
                inputURI={inputURI}
                outputURI={outputURI}
                mobile={mobile}
              />
              <TitleComponent
                loading={loading}
                downloadReady={outputURI != null && userHasRun}
                modelLoading={modelLoading}
                mobile={mobile}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
