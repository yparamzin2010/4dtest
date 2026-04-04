class LibraryPanel {
  constructor(root, options = {}) {
    this.root = root;
    this.onSelect = options.onSelect || (() => {});
    this.listContainer = this.root.querySelector("[data-library-list]");
    this.titleElement = this.root.querySelector("[data-library-title]");
    this.descriptionElement = this.root.querySelector("[data-library-description]");
  }

  render(shapes, activeShapeId) {
    const grouped = new Map();

    for (const shape of shapes) {
      if (!grouped.has(shape.category)) {
        grouped.set(shape.category, []);
      }

      grouped.get(shape.category).push(shape);
    }

    this.listContainer.innerHTML = "";

    for (const [category, categoryShapes] of grouped.entries()) {
      const section = document.createElement("section");
      section.className = "library-section";

      const heading = document.createElement("h2");
      heading.className = "library-section-title";
      heading.textContent = category;
      section.appendChild(heading);

      const list = document.createElement("div");
      list.className = "library-list";

      for (const shape of categoryShapes) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "library-item";
        button.textContent = shape.name;
        button.dataset.shapeId = shape.id;

        if (shape.id === activeShapeId) {
          button.classList.add("is-active");
        }

        button.addEventListener("click", () => this.onSelect(shape.id));
        list.appendChild(button);
      }

      section.appendChild(list);
      this.listContainer.appendChild(section);
    }
  }

  setActiveShape(shape) {
    const buttons = this.root.querySelectorAll(".library-item");

    for (const button of buttons) {
      button.classList.toggle("is-active", button.dataset.shapeId === shape.id);
    }

    this.titleElement.textContent = shape.name;
    this.descriptionElement.textContent = shape.description;
  }
}

window.LibraryPanel = LibraryPanel;
