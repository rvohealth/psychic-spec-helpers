import './App.css'

function App() {
  return (
    <>
      <button id="my-button">My button</button>
      <a>My link</a>
      <div id="my-div">My div</div>
      <input id="my-input" />

      <select id="select-box">
        <option>option 1</option>
        <option>option 2</option>
      </select>

      <div>
        <label htmlFor="my-checkbox">My checkbox</label>
        <input type="checkbox" id="my-checkbox" />
      </div>
    </>
  )
}

export default App
