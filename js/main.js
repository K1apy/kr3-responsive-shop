document.documentElement.classList.add("js");

const desktop = window.matchMedia("(min-width: 1024px)");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.getElementById("site-navigation");
const filtersButton = document.querySelector(".filters-toggle");
const filtersPanel = document.getElementById("filter-options");

function setPanel(button, panel, open, restoreFocus = false) {
  button.setAttribute("aria-expanded", String(open));
  panel.classList.toggle("is-open", open);
  if (button === filtersButton)
    button.textContent = open ? "Скрыть" : "Показать";
  if (restoreFocus) button.focus();
}

if (menuButton && navigation) {
  menuButton.hidden = false;
  menuButton.addEventListener("click", () => {
    setPanel(
      menuButton,
      navigation,
      menuButton.getAttribute("aria-expanded") !== "true",
    );
  });
  navigation.addEventListener("click", (event) => {
    if (!desktop.matches && event.target.closest("a"))
      setPanel(menuButton, navigation, false);
  });
  document.addEventListener("click", (event) => {
    if (!desktop.matches && !event.target.closest(".site-header")) {
      setPanel(menuButton, navigation, false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !desktop.matches &&
      navigation.classList.contains("is-open")
    ) {
      setPanel(menuButton, navigation, false, true);
    }
  });
}

if (filtersButton && filtersPanel) {
  filtersButton.hidden = false;
  setPanel(filtersButton, filtersPanel, desktop.matches);
  filtersButton.addEventListener("click", () => {
    setPanel(
      filtersButton,
      filtersPanel,
      filtersButton.getAttribute("aria-expanded") !== "true",
    );
  });
  filtersPanel.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !desktop.matches) {
      setPanel(filtersButton, filtersPanel, false, true);
    }
  });
}

desktop.addEventListener("change", () => {
  if (menuButton && navigation) {
    const restore =
      !desktop.matches && navigation.contains(document.activeElement);
    setPanel(menuButton, navigation, desktop.matches, restore);
  }
  if (filtersButton && filtersPanel) {
    const restore =
      !desktop.matches && filtersPanel.contains(document.activeElement);
    setPanel(filtersButton, filtersPanel, desktop.matches, restore);
  }
});

document.querySelectorAll("[data-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.dialog).showModal();
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(
      dialog.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
      ),
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    ) {
      dialog.close();
    }
  });
});

const productSelect = document.getElementById("order-product");
const selectedProduct = new URLSearchParams(window.location.search).get(
  "product",
);

if (
  productSelect &&
  Array.from(productSelect.options).some(
    (option) => option.value === selectedProduct,
  )
) {
  productSelect.value = selectedProduct;
}

document.querySelectorAll("[data-demo-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    document.getElementById(form.dataset.successDialog).showModal();
  });
  form.querySelector('[type="submit"]').disabled = false;
});

const catalogFilter = document.getElementById("catalog-filter");

if (catalogFilter) {
  const cards = Array.from(
    document.querySelectorAll(".catalog-category .product-card"),
  );
  const categories = document.querySelectorAll(".catalog-category");
  const count = document.getElementById("catalog-count");
  const empty = document.getElementById("catalog-empty");

  function applyFilters() {
    const data = new FormData(catalogFilter);
    const query = data.get("search").trim().toLocaleLowerCase("ru");
    const category = data.get("category");
    const price = data.get("price");
    let visible = 0;

    cards.forEach((card) => {
      const title = card
        .querySelector("h3")
        .textContent.toLocaleLowerCase("ru");
      const cost = Number(card.dataset.price);
      const matches =
        title.includes(query) &&
        (category === "all" || card.dataset.category === category) &&
        (price === "any" ||
          (price === "low" && cost <= 1000) ||
          (price === "high" && cost > 1000));
      card.hidden = !matches;
      if (matches) visible += 1;
    });

    categories.forEach((section) => {
      section.hidden = !section.querySelector(".product-card:not([hidden])");
    });
    count.textContent = `Показано товаров: ${visible} из ${cards.length}`;
    empty.hidden = visible !== 0;
  }

  catalogFilter.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
    if (!desktop.matches) {
      setPanel(filtersButton, filtersPanel, false, true);
      document
        .getElementById("catalog-results")
        .scrollIntoView({ block: "start" });
    }
  });
  catalogFilter.addEventListener("reset", () => {
    requestAnimationFrame(applyFilters);
  });
  document.getElementById("empty-reset").addEventListener("click", () => {
    catalogFilter.reset();
    filtersButton.focus();
    if (desktop.matches) document.getElementById("filter-search").focus();
  });
}
