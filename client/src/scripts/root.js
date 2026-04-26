/* Global Floating Notification Toast Utility */
window.showNotification = function(message, type = "info") {
  let container = document.querySelector(".notification-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "notification-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `notification-toast ${type}`;
  
  let icon = "fa-info-circle";
  if (type === "success") icon = "fa-check-circle";
  if (type === "error") icon = "fa-exclamation-triangle";

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) {
      container.remove();
    }
  }, 3000);
};

document.addEventListener("DOMContentLoaded", () => {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");

  if (headerPlaceholder) {
    fetch("../components/header.html")
      .then(res => res.text())
      .then(html => {
        headerPlaceholder.innerHTML = html;
        initHeader();
        if (window.applyThemeColors) window.applyThemeColors();
      });
  }

  if (footerPlaceholder) {
    fetch("../components/footer.html")
      .then(res => res.text())
      .then(html => {
        footerPlaceholder.innerHTML = html;
        if (window.applyThemeColors) window.applyThemeColors();
      });
  }

  function initHeader() {
    function scrollHeader() {
      const header = document.getElementById("header");
      if (window.scrollY >= 15) header.classList.add("scroll-header");
      else header.classList.remove("scroll-header");
    }
    window.addEventListener("scroll", scrollHeader);

    const cart = document.getElementById("cart"),
      cartShop = document.getElementById("cart-shop"),
      cartClose = document.getElementById("cart-close"),
      login = document.getElementById("login");

    if (cartShop) {
      cartShop.addEventListener("click", () => {
        cart.classList.toggle("show-cart");
        if (login) login.classList.remove("show-login");
      });
    }

    if (cartClose) {
      cartClose.addEventListener("click", () => {
        cart.classList.remove("show-cart");
      });
    }

    const loginToggel = document.getElementById("login-toggle"),
      loginClose = document.getElementById("login-close");

    if (loginToggel) {
      loginToggel.addEventListener("click", () => {
        login.classList.toggle("show-login");
        if (cart) cart.classList.remove("show-cart");
      });
    }

    if (loginClose) {
      loginClose.addEventListener("click", () => {
        login.classList.remove("show-login");
      });
    }

    const nav = document.getElementById("nav-items"),
      navToggel = document.getElementById("nav-toggle"),
      iconToggel = document.getElementById("icon-toggel");

    if (navToggel) {
      navToggel.addEventListener("click", () => {
        if (nav) nav.classList.toggle("nav-show");
        if (iconToggel) iconToggel.classList.toggle("fa-times");
      });
    }

    // Dynamic Cart Mapping Logic
    function updateCartUI() {
      const cartContainer = document.querySelector(".cart-container");
      const cartPricesItem = document.querySelector(".cart-prices-item");
      const cartPricesTotal = document.querySelector(".cart-prices-total");

      if (!cartContainer) return;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cartContainer.innerHTML = "";

      const badge = document.getElementById("cart-count-badge");

      if (cart.length === 0) {
        cartContainer.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--text-color);">Your cart is empty.</p>`;
        if (cartPricesItem) cartPricesItem.innerText = "0 Items";
        if (cartPricesTotal) cartPricesTotal.innerText = "$0";
        if (badge) {
          badge.style.display = "none";
          badge.innerText = "0";
        }
        return;
      }


      let totalItems = 0;
      let totalPrice = 0;

      cart.forEach((item, index) => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        const article = document.createElement("article");
        article.className = "cart-card";
        article.innerHTML = `
          <div class="cart-box"><img class="cart-img" src="${item.image}" alt="${item.name}" /></div>
          <div class="cart-details">
            <h3 class="cart-title-center">${item.name}</h3>
            <span class="cart-price">$${item.price}</span>
            <div class="cart-amount">
              <div class="cart-amount-content">
                <span class="cart-amount-box minus-btn" data-index="${index}"><i class="fas fa-minus"></i></span>
                <span class="card-amount-number">${item.quantity}</span>
                <span class="cart-amount-box plus-btn" data-index="${index}"><i class="fas fa-plus"></i></span>
              </div>
              <i class="fas fa-trash cart-amount-trash trash-btn" data-index="${index}"></i>
            </div>
          </div>
        `;
        cartContainer.appendChild(article);
      });

      if (cartPricesItem) cartPricesItem.innerText = `${totalItems} Item${totalItems > 1 ? 's' : ''}`;
      if (cartPricesTotal) cartPricesTotal.innerText = `$${totalPrice.toFixed(2)}`;
      
      if (badge) {
        badge.style.display = "flex";
        badge.innerText = totalItems;
      }


      // Bind Increments / Decrements
      cartContainer.querySelectorAll(".minus-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = btn.getAttribute("data-index");
          if (cart[idx].quantity > 1) {
            cart[idx].quantity -= 1;
          } else {
            cart.splice(idx, 1);
          }
          localStorage.setItem("cart", JSON.stringify(cart));
          updateCartUI();
        });
      });

      cartContainer.querySelectorAll(".plus-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = btn.getAttribute("data-index");
          cart[idx].quantity += 1;
          localStorage.setItem("cart", JSON.stringify(cart));
          updateCartUI();
        });
      });

      cartContainer.querySelectorAll(".trash-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = btn.getAttribute("data-index");
          cart.splice(idx, 1);
          localStorage.setItem("cart", JSON.stringify(cart));
          updateCartUI();
        });
      });
    }

    window.updateCartUI = updateCartUI;
    updateCartUI();

    // Dynamic Active Nav Link Logic
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link");
    
    let matched = false;
    navLinks.forEach(link => {
      link.classList.remove("active-link");
      const href = link.getAttribute("href");
      if (href && currentPath.includes(href)) {
        link.classList.add("active-link");
        matched = true;
      }
    });
    
    if (!matched && navLinks.length > 0) {
      // Default to Home if no match (like root index path)
      const homeLink = Array.from(navLinks).find(el => el.getAttribute("href") === "index.html");
      if (homeLink) homeLink.classList.add("active-link");
    }

    themesColors();

  }

  function showScrollUp() {
    const scrollUpBtn = document.getElementById("scroll-up");
    if (window.scrollY >= 350) scrollUpBtn.classList.add("show-scroll");
    else scrollUpBtn.classList.remove("show-scroll");
  }
  window.addEventListener("scroll", showScrollUp);

  const styleSwitcherToggle = document.querySelector(".style-switcher-toggler");
  if (styleSwitcherToggle) {
    styleSwitcherToggle.addEventListener("click", () => {
      document.querySelector(".style-switcher").classList.toggle("open");
    });
  }

  window.addEventListener("scroll", () => {
    const switcher = document.querySelector(".style-switcher");
    if (switcher && switcher.classList.contains("open")) {
      switcher.classList.remove("open");
    }
  });

  function setColors() {
    const color = localStorage.getItem("color") || "color-2";
    document.documentElement.setAttribute("data-theme", color);

    const logoImg = document.querySelector(".nav-logo-img");
    const footerLogoImg = document.querySelector(".footer-logo-img");
    const logoMap = {
      "color-1": "logo-red.png",
      "color-2": "logo-purple.png",
      "color-3": "logo-pink.png",
      "color-4": "logo-lavender.png",
      "color-5": "logo-orange.png"
    };

    if (logoImg) {
      logoImg.src = `../../public/images/logos/${logoMap[color]}`;
    }
    if (footerLogoImg) {
      footerLogoImg.src = `../../public/images/logos/${logoMap[color]}`;
    }

    if (document.querySelector(".js-theme-color-item.active")) {
      document.querySelector(".js-theme-color-item.active").classList.remove("active");
    }
    const activeBtn = document.querySelector(`[data-js-themes-color="${color}"]`);
    if (activeBtn) activeBtn.classList.add("active");
  }

  window.applyThemeColors = setColors;

  function themesColors() {
    const themesColorsContainer = document.querySelector(".js-theme-colors");
    if (!themesColorsContainer) return;

    themesColorsContainer.addEventListener("click", ({ target }) => {
      if (target.classList.contains("js-theme-color-item")) {
        localStorage.setItem(
          "color",
          target.getAttribute("data-js-themes-color"),
        );
        setColors();
      }
    });

    setColors();
  }

  themesColors();
});


