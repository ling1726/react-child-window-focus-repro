import * as React from "react";
import * as ReactDOM from "react-dom/client";

function App() {
  const [childWindow, setChildWindow] = React.useState<Window | null>(null);

  const openWindow = () => {
    setChildWindow(window.open("", "_blank", "popup=true"));
  };

  React.useEffect(() => {
    if (childWindow) {
      childWindow.onbeforeunload = () => {
        setChildWindow(null);
      };

      const container = childWindow.document.createElement("div");
      childWindow.document.body.appendChild(container);
      const renderer = ReactDOM.createRoot(container);
      renderer.render(<ChildWindowApp targetWindow={childWindow} />);
    }
  }, [childWindow]);

  return (
    <div>
      <button disabled={!!childWindow} onClick={openWindow}>
        Open sample app in child window
      </button>
      <ChildWindowApp targetWindow={window} />
    </div>
  );
}

export default App;

const ChildWindowApp: React.FC<{ targetWindow: Window }> = ({
  targetWindow,
}) => {
  const counterRef = React.useRef(0);
  const [items, setItems] = React.useState<string[]>(() => {
    return Array.from({ length: 10 }, () => `Item ${counterRef.current++}`);
  });

  const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setItems((prev) => {
        const index = prev.findIndex(
          (item) => item === targetWindow.document.activeElement?.textContent
        );

        if (index === prev.length - 1) {
          alert("you've reached the end!");
          return prev;
        }

        const newState = [...prev];
        const tmp = newState[index];
        newState[index] = newState[index + 1];
        newState[index + 1] = tmp;

        setTimeout(() => {
          buttonRefs.current[index + 1]?.focus();
        }, 0);

        return newState;
      });
    }

    if (e.key === "ArrowUp") {
      setItems((prev) => {
        const index = prev.findIndex(
          (item) => item === document.activeElement?.textContent
        );

        if (index === 0) {
          alert("you've reached the start!");
          return prev;
        }

        const newState = [...prev];
        const tmp = newState[index];
        newState[index] = newState[index - 1];
        newState[index - 1] = tmp;

        setTimeout(() => {
          buttonRefs.current[index - 1]?.focus();
        }, 0);

        return newState;
      });
    }
  };

  return (
    <>
      <h2>Sample repro app</h2>
      <p>
        This app demonstrates a bug in child windows where focus is lost when
        elements are reordered. This example uses <strong>ArrowUp</strong> and{" "}
        <strong>ArrowDown</strong> keys to move the focused item up and down.
      </p>

      <p>
        When using the sample app in a child window you can see that focus is
        lost immediately after reordering.
      </p>
      <div
        onKeyDown={onKeyDown}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {items.map((item, index) => (
          <button ref={(elm) => buttonRefs.current[index] = elm} key={item}>
            {item}
          </button>
        ))}
      </div>
    </>
  );
};
