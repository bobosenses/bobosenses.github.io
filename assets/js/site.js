(function () {
  "use strict";

  var root = document.documentElement;
  var themeButton = document.querySelector("[data-theme-toggle]");
  var menuButton = document.querySelector("[data-menu-button]");
  var nav = document.querySelector("[data-nav]");
  var searchForm = document.querySelector("[data-search]");
  var searchInput = document.querySelector("[data-search-input]");
  var searchPanel = document.querySelector("[data-search-panel]");
  var toTop = document.querySelector("[data-to-top]");

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function resolvedTheme() {
    var explicit = root.getAttribute("data-theme");
    if (explicit === "light" || explicit === "dark") return explicit;
    return systemTheme();
  }

  function updateThemeButton() {
    if (!themeButton) return;
    var next = resolvedTheme() === "dark" ? "浅色" : "深色";
    themeButton.setAttribute("aria-label", "切换到" + next);
  }

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var next = resolvedTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (err) {}
      updateThemeButton();
    });
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateThemeButton);
  updateThemeButton();

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    }
    if (searchPanel && !searchPanel.hidden) {
      searchPanel.hidden = true;
      if (searchInput) searchInput.value = "";
    }
  });

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }

  if (searchInput && searchPanel) {
    var docs = null;
    var loading = null;

    function loadDocs() {
      if (docs) return Promise.resolve(docs);
      if (!loading) {
        var indexUrl = searchInput.getAttribute("data-search-index");
        loading = fetch(indexUrl).then(function (response) {
          if (!response.ok) throw new Error("search index");
          return response.json();
        }).then(function (data) {
          docs = data;
          return docs;
        });
      }
      return loading;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
      });
    }

    function render(items, query) {
      if (!query) {
        searchPanel.hidden = true;
        searchPanel.innerHTML = "";
        return;
      }
      searchPanel.hidden = false;
      if (!items.length) {
        searchPanel.innerHTML = '<p class="search-empty">没有找到相关文章</p>';
        return;
      }
      var html = '<ul class="search-list">';
      items.forEach(function (item) {
        html += '<li><a href="' + escapeHtml(item.url) + '"><span>' + escapeHtml(item.title) + '</span><small>' + escapeHtml(item.date) + '</small></a></li>';
      });
      html += "</ul>";
      searchPanel.innerHTML = html;
    }

    var timer = 0;
    searchInput.addEventListener("input", function () {
      var query = searchInput.value.trim().toLowerCase();
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        if (!query) {
          render([], "");
          return;
        }
        loadDocs().then(function (list) {
          var hits = list.filter(function (item) {
            var haystack = (item.title + " " + item.text + " " + item.categories + " " + item.tags).toLowerCase();
            return haystack.indexOf(query) !== -1;
          }).slice(0, 8);
          render(hits, query);
        }).catch(function () {
          searchPanel.hidden = false;
          searchPanel.innerHTML = '<p class="search-empty">搜索暂时不可用</p>';
        });
      }, 80);
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest("[data-search]")) searchPanel.hidden = true;
    });
  }

  if (toTop) {
    var reduceForTop = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var updateToTop = function () {
      toTop.hidden = window.scrollY < 700;
    };
    document.addEventListener("scroll", updateToTop, { passive: true });
    updateToTop();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceForTop ? "auto" : "smooth" });
    });
  }

  var article = document.querySelector("[data-prose]");
  var toc = document.querySelector("[data-toc]");
  if (article && toc) {
    var headings = article.querySelectorAll("h2, h3");
    var listHost = toc.querySelector("[data-toc-list]");
    var details = toc.querySelector("[data-toc-details]");
    if (headings.length >= 2 && listHost) {
      var list = document.createElement("ol");
      headings.forEach(function (heading) {
        if (!heading.id) {
          heading.id = "section-" + Math.random().toString(36).slice(2, 8);
        }
        var item = document.createElement("li");
        if (heading.tagName === "H3") item.className = "toc-sub";
        var link = document.createElement("a");
        link.href = "#" + heading.id;
        link.textContent = heading.textContent;
        item.appendChild(link);
        list.appendChild(item);
      });
      listHost.appendChild(list);
      toc.hidden = false;

      var wide = window.matchMedia("(min-width: 64rem)");
      var syncToc = function () {
        if (details && wide.matches) details.open = true;
      };
      syncToc();
      wide.addEventListener("change", syncToc);
      if (details) {
        var summary = details.querySelector("summary");
        if (summary) {
          summary.addEventListener("click", function (event) {
            if (wide.matches) event.preventDefault();
          });
        }
      }
    }
  }

  document.querySelectorAll(".prose table").forEach(function (table) {
    if (table.parentElement && table.parentElement.classList.contains("table-scroll")) return;
    var wrap = document.createElement("div");
    wrap.className = "table-scroll";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wideScreen = window.matchMedia("(min-width: 800px)");
  var header = document.querySelector(".site-header");
  var progress = document.querySelector("[data-scroll-progress]");
  var revealNodes = document.querySelectorAll("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach(function (node) { node.classList.add("is-in"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealNodes.forEach(function (node) { observer.observe(node); });
  }

  var anchor = window.scrollY;
  var frame = 0;
  function onScrollFrame() {
    var y = window.scrollY;
    var delta = y - anchor;
    if (header) {
      header.classList.toggle("is-scrolled", y > 8);
      var menuOpen = nav && nav.classList.contains("is-open");
      if (menuOpen || y < 72) {
        header.classList.remove("is-hidden");
        anchor = y;
      } else if (!reduceMotion && wideScreen.matches && delta > 28) {
        header.classList.add("is-hidden");
        anchor = y;
      } else if (delta < -18) {
        header.classList.remove("is-hidden");
        anchor = y;
      }
    }
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
    }
    frame = 0;
  }

  document.addEventListener("scroll", function () {
    if (frame) return;
    frame = window.requestAnimationFrame(onScrollFrame);
  }, { passive: true });
  onScrollFrame();

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      if (header) header.classList.remove("is-hidden");
    });
  }
})();
