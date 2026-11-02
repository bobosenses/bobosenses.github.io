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
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
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
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var onScroll = function () {
      toTop.hidden = window.scrollY < 700;
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
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
})();
