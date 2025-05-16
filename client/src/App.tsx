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

      <div>
        <label htmlFor="my-other-checkbox">
          <span>My other checkbox</span>
        </label>
        <input type="checkbox" id="my-other-checkbox" />
      </div>

      <div>
        <label htmlFor="invalid-pointer">My invalid label pointer checkbox</label>
        <input type="checkbox" id="my-invalid-pointer-checkbox" />
      </div>

      <div>
        <label>My missing htmlFor checkbox</label>
        <input type="checkbox" id="my-yetanother-checkbox" />
      </div>
    </>
  )
}

export default App
