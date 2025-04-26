import { FormEvent, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../amplify/data/resource";  // important
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const ingredientsRaw = formData.get("ingredients")?.toString() || "";

      if (!ingredientsRaw.trim()) {
        alert("Please enter some ingredients first.");
        setLoading(false);
        return;
      }

      const ingredients = ingredientsRaw.split(",").map((i) => i.trim());

      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients,
      });

      if (data) {
        setResult(data.body || "No recipe returned.");
      } else if (errors) {
        console.error("Errors from API:", errors);
        alert("An error occurred. See console for details.");
      } else {
        setResult("No response from server.");
      }
    } catch (e) {
      console.error("Catch Error:", e);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Mark Oluoni's <br /> Personal <br />
          <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Type ingredients (e.g., Chicken, Rice, Beans) and get a new recipe!
        </p>
      </div>

      <form onSubmit={onSubmit} className="form-container">
        <input
          type="text"
          id="ingredients"
          name="ingredients"
          placeholder="Ingredient1, Ingredient2, Ingredient3, ..."
          required
        />
        <button type="submit" className="search-button">Generate</button>
      </form>

      <div className="result-container">
        {loading ? (
          <div className="loader-container"><p>Loading...</p></div>
        ) : (
          result && <p className="result">{result}</p>
        )}
      </div>
    </div>
  );
}

export default App;
