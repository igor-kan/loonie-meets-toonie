// chrome-extension/src/contentScript.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface ProductOverlayProps {
  asin: string;
  classification?: number;
}

const ProductOverlay: React.FC<ProductOverlayProps> = ({ asin, classification }) => {
  return (
    <div className="fixed top-2 right-2 z-50 bg-white p-2 border rounded shadow">
      {classification !== undefined ? (
        <span className="text-green-600 font-bold">
          🇨🇦 {classification >= 50 ? "V" : "?"}
        </span>
      ) : (
        <span>Loading classification...</span>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [asin, setAsin] = useState<string>("");
  const [classification, setClassification] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Attempt to extract the ASIN from the Amazon page – adjust selector as needed.
    const asinElement = document.querySelector("[data-asin]");
    if (asinElement) {
      const asinVal = (asinElement as HTMLElement).getAttribute("data-asin") || "";
      setAsin(asinVal);
      // Optionally, you could fetch classification data from your backend here.
      // For demonstration, we set a static value.
      setClassification(70);
    }
  }, []);

  return <ProductOverlay asin={asin} classification={classification} />;
};

const container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(<App />, container);
