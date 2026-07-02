(function () {
  const data = window.cvData;
  const qs = (selector) => document.querySelector(selector);
  const projectGalleryState = {
    modal: null,
    image: null,
    title: null,
    counter: null,
    prev: null,
    next: null,
    items: [],
    index: 0,
    projectName: ""
  };

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function initAppLoader() {
    const loaderName = qs("#appLoaderName");
    const loaderAvatar = qs("#appLoaderAvatar");
    if (loaderName) loaderName.textContent = data.personal.preferredName || data.personal.name;
    if (loaderAvatar) {
      loaderAvatar.src = data.personal.image;
      loaderAvatar.alt = `${data.personal.name} profile photo`;
      loaderAvatar.loading = "eager";
      loaderAvatar.decoding = "async";
      loaderAvatar.setAttribute("fetchpriority", "high");
    }
  }

  function initSiteMeta() {
    const lastUpdatedEl = qs("#siteLastUpdated");
    if (!lastUpdatedEl) return;

    const siteUrl = data.siteMeta?.siteUrl || "https://albertomitroi.github.io/";
    const lastUpdated = data.siteMeta?.lastUpdated || "";
    const displayUrl = String(siteUrl).replace(/^https?:\/\//, "").replace(/\/$/, "");

    lastUpdatedEl.textContent = "";
    const label = createEl("span", "", lastUpdated ? `Last updated: ${lastUpdated}` : "Last updated recently");
    const separator = createEl("span", "footer-separator", "·");
    const link = createEl("a", "footer-source-link", displayUrl);
    link.href = siteUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    lastUpdatedEl.append(label, separator, link);
  }

  function getResumeLastUpdatedLabel() {
    const fromData = String(data.siteMeta?.lastUpdated || "").trim();
    if (fromData) return fromData;
    return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  function waitForImageReady(image) {
    if (!image) return Promise.resolve();
    if (typeof image.decode === "function") {
      return image.decode().catch(() => {});
    }
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }

  async function waitForAssetsReady() {
    const criticalImageSelectors = ["#appLoaderAvatar", "#brandAvatar", "#heroImage"];
    const criticalImages = criticalImageSelectors
      .map((selector) => qs(selector))
      .filter(Boolean);
    await Promise.all(criticalImages.map((image) => waitForImageReady(image)));
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  }

  async function revealPageWhenReady() {
    const loader = qs("#appLoader");
    await waitForAssetsReady();
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    if (loader) {
      loader.setAttribute("aria-hidden", "true");
    }
  }

  function safeLink(url) {
    return typeof url === "string" && url.trim().length > 0;
  }

  function externalLink(label, url, className = "link-inline") {
    const a = createEl("a", className, label);
    a.href = url;
    a.target = "_blank";
    a.rel = "noreferrer";
    return a;
  }

  function appendPillContent(target, text, iconSrc) {
    if (iconSrc) {
      const icon = createEl("img", "pill-icon");
      icon.src = iconSrc;
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      target.appendChild(icon);
    }
    target.appendChild(createEl("span", "pill-text", text));
  }

  function initHero() {
    qs("#brandName").textContent = data.personal.preferredName;
    const brandAvatar = qs("#brandAvatar");
    brandAvatar.src = data.personal.image;
    brandAvatar.alt = `${data.personal.name} profile photo`;
    brandAvatar.loading = "eager";
    brandAvatar.decoding = "async";
    qs("#heroName").textContent = data.personal.name;
    qs("#heroRole").textContent = data.personal.role;
    qs("#heroLead").textContent = data.personal.headline;
    const heroImage = qs("#heroImage");
    heroImage.src = data.personal.image;
    heroImage.alt = `${data.personal.name} profile portrait`;
    heroImage.loading = "eager";
    heroImage.decoding = "async";
    heroImage.setAttribute("fetchpriority", "high");

    const meta = qs("#heroMeta");
    const metaItems = [
      { text: data.personal.location, icon: "assets/location-pin-svgrepo-com.svg" },
      { text: data.personal.workMode, icon: "assets/chair-2-svgrepo-com.svg" },
      { text: data.personal.email, icon: "assets/gmail-svgrepo-com.svg" }
    ];
    metaItems.forEach((item) => {
      const li = createEl("li");
      const span = createEl("span", "meta-pill");
      appendPillContent(span, item.text, item.icon);
      li.appendChild(span);
      meta.appendChild(li);
    });

    const socialRow = qs("#socialLinks");
    const socialIcons = {
      github: "assets/github-142-svgrepo-com.svg",
      linkedin: "assets/linkedin-svgrepo-com.svg",
      topzonal: "assets/topzonal-logo.webp"
    };

    data.links.forEach((item) => {
      const iconSrc = socialIcons[item.label.toLowerCase()] || "";
      const label = `${item.label} · ${item.value}`;
      if (safeLink(item.url)) {
        const link = createEl("a", "social-link");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noreferrer";
        appendPillContent(link, label, iconSrc);
        socialRow.appendChild(link);
      } else {
        const span = createEl("span", "social-link");
        appendPillContent(span, label, iconSrc);
        socialRow.appendChild(span);
      }
    });

    const facts = qs("#heroFacts");
    data.heroFacts.forEach((fact) => {
      facts.appendChild(createEl("span", "fact-pill", fact));
    });
  }

  function initAbout() {
    const about = qs("#aboutCopy");
    data.summary.forEach((paragraph) => about.appendChild(createEl("p", "", paragraph)));

    const highlights = qs("#aboutHighlights");
    if (highlights && Array.isArray(data.aboutHighlights)) {
      data.aboutHighlights.forEach((item) => highlights.appendChild(createEl("li", "about-highlight", item)));
    }

    const focus = qs("#focusCards");
    data.focusAreas.forEach((area) => {
      const card = createEl("article", "focus-card");
      card.appendChild(createEl("h4", "", area.title));
      card.appendChild(createEl("p", "", area.text));
      focus.appendChild(card);
    });
  }

  function parsePeriodBounds(period) {
    const chunks = String(period || "").split(/\s*[–-]\s*/).map((chunk) => chunk.trim()).filter(Boolean);
    if (chunks.length <= 1) return { start: chunks[0] || String(period || ""), end: chunks[0] || String(period || "") };
    return { start: chunks[0], end: chunks[1] };
  }

  function parseMonthYear(label) {
    if (!label) return null;
    const clean = String(label).trim().replace(/\./g, "");
    if (!clean) return null;

    if (/present/i.test(clean)) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() };
    }

    const [monthToken, yearToken] = clean.split(/\s+/);
    const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    };
    const month = monthMap[(monthToken || "").toLowerCase()];
    const year = Number(yearToken);
    if (month === undefined || Number.isNaN(year)) return null;
    return { year, month };
  }

  function formatDuration(totalMonths) {
    const safeTotal = Math.max(1, totalMonths);
    const years = Math.floor(safeTotal / 12);
    const months = safeTotal % 12;
    const yearText = years ? `${years} year${years > 1 ? "s" : ""}` : "";
    const monthText = months ? `${months} month${months > 1 ? "s" : ""}` : "";
    return [yearText, monthText].filter(Boolean).join(" ");
  }

  function buildCompanyPeriod(roles) {
    if (!roles.length) return "";
    const latest = parsePeriodBounds(roles[0].period);
    const earliest = parsePeriodBounds(roles[roles.length - 1].period);
    return `${earliest.start} – ${latest.end}`;
  }

  function buildCompanyDuration(roles) {
    if (!roles.length) return "";
    const latest = parsePeriodBounds(roles[0].period);
    const earliest = parsePeriodBounds(roles[roles.length - 1].period);
    const start = parseMonthYear(earliest.start);
    const end = parseMonthYear(latest.end);
    if (!start || !end) return "";
    const months = ((end.year - start.year) * 12) + (end.month - start.month) + 1;
    return formatDuration(months);
  }

  function groupExperienceByCompany(entries) {
    const groups = [];
    entries.forEach((entry) => {
      const current = groups[groups.length - 1];
      const sameCompany = current
        && current.company === entry.company
        && (current.website || "") === (entry.website || "");
      if (sameCompany) {
        current.roles.push(entry);
        if (!current.companyLogo && entry.companyLogo) current.companyLogo = entry.companyLogo;
      } else {
        groups.push({
          company: entry.company,
          companyLogo: entry.companyLogo || "",
          website: entry.website,
          roles: [entry]
        });
      }
    });
    return groups;
  }

  function initExperience() {
    const list = qs("#experienceList");
    const groups = groupExperienceByCompany(data.experience);

    groups.forEach((group) => {
      const item = createEl("article", "timeline-item timeline-item--company");

      const meta = createEl("div", "timeline-meta");
      const companyHead = createEl("div", "timeline-company-head");
      if (group.companyLogo) {
        const logo = createEl("img", "timeline-company-logo");
        logo.src = group.companyLogo;
        logo.alt = `${group.company} logo`;
        logo.loading = "lazy";
        logo.decoding = "async";
        companyHead.appendChild(logo);
      }
      const companyText = createEl("div", "timeline-company-text");
      companyText.appendChild(createEl("div", "timeline-company", group.company));
      const companyPeriod = buildCompanyPeriod(group.roles);
      const companySummary = createEl("div", "timeline-company-summary");
      companySummary.appendChild(createEl("span", "timeline-company-period", companyPeriod));
      companyText.appendChild(companySummary);
      companyHead.appendChild(companyText);
      meta.appendChild(companyHead);

      const companyDuration = buildCompanyDuration(group.roles);
      if (companyDuration) meta.appendChild(createEl("div", "timeline-duration", companyDuration));

      const locations = [...new Set(group.roles.map((role) => role.location).filter(Boolean))];
      if (locations.length === 1) meta.appendChild(createEl("div", "timeline-location", locations[0]));
      if (locations.length > 1) meta.appendChild(createEl("div", "timeline-location", "Multiple locations"));

      if (safeLink(group.website)) {
        const websiteWrap = createEl("div", "timeline-location");
        websiteWrap.appendChild(externalLink(group.website.replace(/^https?:\/\//, ""), group.website));
        meta.appendChild(websiteWrap);
      }

      const stackClass = group.roles.length > 1 ? "timeline-role-stack" : "timeline-role-stack timeline-role-stack--single";
      const roleStack = createEl("div", stackClass);

      group.roles.forEach((role) => {
        const roleItem = createEl("article", "timeline-role-item");
        const connector = createEl("span", "timeline-role-connector");
        connector.setAttribute("aria-hidden", "true");
        roleItem.appendChild(connector);

        const roleMain = createEl("div", "timeline-role-main");
        roleMain.appendChild(createEl("h4", "timeline-role-title", role.role));
        roleMain.appendChild(createEl("div", "timeline-role-meta", role.period));
        roleMain.appendChild(createEl("p", "timeline-role-intro", role.intro));

        const ul = createEl("ul", "bullet-list");
        role.bullets.forEach((bullet) => ul.appendChild(createEl("li", "", bullet)));
        roleMain.appendChild(ul);

        roleItem.appendChild(roleMain);
        roleStack.appendChild(roleItem);
      });

      item.append(meta, roleStack);
      list.appendChild(item);
    });
  }

  function normalizeProjectGallery(project) {
    if (!Array.isArray(project.gallery)) return [];
    return project.gallery
      .map((item, index) => {
        if (typeof item === "string") return { src: item, alt: `${project.name} preview ${index + 1}` };
        if (!item || typeof item !== "object") return null;
        if (typeof item.src !== "string" || !item.src.trim()) return null;
        return {
          src: item.src,
          alt: item.alt || `${project.name} preview ${index + 1}`
        };
      })
      .filter(Boolean);
  }

  function renderProjectGalleryModal() {
    const state = projectGalleryState;
    if (!state.items.length || !state.image || !state.counter || !state.title) return;
    const current = state.items[state.index];
    state.image.src = current.src;
    state.image.alt = current.alt || `${state.projectName} screenshot ${state.index + 1}`;
    state.title.textContent = state.projectName;
    state.counter.textContent = `${state.index + 1} / ${state.items.length}`;

    if (state.prev && state.next) {
      const disabled = state.items.length <= 1;
      state.prev.disabled = disabled;
      state.next.disabled = disabled;
    }
  }

  function closeProjectGallery() {
    const state = projectGalleryState;
    if (!state.modal || state.modal.hasAttribute("hidden")) return;
    state.modal.setAttribute("hidden", "hidden");
    state.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-gallery-open");
  }

  function stepProjectGallery(step) {
    const state = projectGalleryState;
    if (!state.items.length) return;
    state.index = (state.index + step + state.items.length) % state.items.length;
    renderProjectGalleryModal();
  }

  function openProjectGallery(projectName, items, startIndex) {
    if (!items.length) return;
    ensureProjectGalleryModal();
    const state = projectGalleryState;
    state.projectName = projectName;
    state.items = items;
    state.index = Math.max(0, Math.min(startIndex || 0, items.length - 1));
    state.modal.removeAttribute("hidden");
    state.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-gallery-open");
    renderProjectGalleryModal();
  }

  function ensureProjectGalleryModal() {
    if (projectGalleryState.modal) return;

    const modal = createEl("div", "project-gallery-modal");
    modal.setAttribute("hidden", "hidden");
    modal.setAttribute("aria-hidden", "true");

    const backdrop = createEl("button", "project-gallery-backdrop");
    backdrop.type = "button";
    backdrop.setAttribute("aria-label", "Close gallery");
    backdrop.addEventListener("click", closeProjectGallery);

    const dialog = createEl("div", "project-gallery-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Project gallery");

    const closeButton = createEl("button", "project-gallery-close", "Close");
    closeButton.type = "button";
    closeButton.addEventListener("click", closeProjectGallery);

    const stage = createEl("div", "project-gallery-stage");
    const prev = createEl("button", "project-gallery-nav project-gallery-nav--prev", "‹");
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous image");
    prev.addEventListener("click", () => stepProjectGallery(-1));

    const image = createEl("img", "project-gallery-image");
    image.alt = "";
    image.decoding = "async";

    const next = createEl("button", "project-gallery-nav project-gallery-nav--next", "›");
    next.type = "button";
    next.setAttribute("aria-label", "Next image");
    next.addEventListener("click", () => stepProjectGallery(1));

    stage.append(prev, image, next);

    const footer = createEl("div", "project-gallery-footer");
    const title = createEl("div", "project-gallery-title");
    const counter = createEl("div", "project-gallery-counter");
    footer.append(title, counter);

    dialog.append(closeButton, stage, footer);
    modal.append(backdrop, dialog);
    document.body.appendChild(modal);

    document.addEventListener("keydown", (event) => {
      if (!projectGalleryState.modal || projectGalleryState.modal.hasAttribute("hidden")) return;
      if (event.key === "Escape") closeProjectGallery();
      if (event.key === "ArrowRight") stepProjectGallery(1);
      if (event.key === "ArrowLeft") stepProjectGallery(-1);
    });

    projectGalleryState.modal = modal;
    projectGalleryState.image = image;
    projectGalleryState.title = title;
    projectGalleryState.counter = counter;
    projectGalleryState.prev = prev;
    projectGalleryState.next = next;
  }

  function createProjectGallery(project) {
    const images = normalizeProjectGallery(project);
    if (!images.length) return null;

    const gallery = createEl("div", "project-gallery");

    const main = createEl("button", "project-gallery-main");
    main.type = "button";
    const mainImage = createEl("img", "project-gallery-main-image");
    mainImage.src = images[0].src;
    mainImage.alt = images[0].alt;
    mainImage.loading = "lazy";
    mainImage.decoding = "async";
    main.appendChild(mainImage);
    const countBadge = createEl("span", "project-gallery-count", `${images.length} photos`);
    const extraPhotos = Math.max(0, images.length - 1);
    const mobileLabel = extraPhotos > 0
      ? `View more photos +${extraPhotos}`
      : "View photo";
    countBadge.setAttribute("data-mobile-label", mobileLabel);
    main.appendChild(countBadge);
    main.addEventListener("click", () => openProjectGallery(project.name, images, 0));
    gallery.appendChild(main);

    const thumbs = createEl("div", "project-gallery-thumbs");
    images.slice(0, 3).forEach((image, index) => {
      const thumb = createEl("button", "project-gallery-thumb");
      thumb.type = "button";
      const thumbImage = createEl("img", "project-gallery-thumb-image");
      thumbImage.src = image.src;
      thumbImage.alt = image.alt;
      thumbImage.loading = "lazy";
      thumbImage.decoding = "async";
      thumb.appendChild(thumbImage);

      if (index === 2 && images.length > 3) {
        thumb.appendChild(createEl("span", "project-gallery-more", `+${images.length - 3}`));
      }

      thumb.addEventListener("click", () => openProjectGallery(project.name, images, index));
      thumbs.appendChild(thumb);
    });
    gallery.appendChild(thumbs);

    const viewAll = createEl("button", "project-gallery-view-all", `View all photos (${images.length})`);
    viewAll.type = "button";
    viewAll.addEventListener("click", () => openProjectGallery(project.name, images, 0));
    gallery.appendChild(viewAll);

    return gallery;
  }

  function initProjects() {
    const list = qs("#projectsList");
    ensureProjectGalleryModal();
    data.projects.forEach((project) => {
      const card = createEl("article", "project-card");

      const top = createEl("div", "project-top");
      const titleWrap = createEl("div", "project-title-wrap");
      if (project.logo) {
        const logo = createEl("img", "project-title-logo");
        logo.src = project.logo;
        logo.alt = `${project.name} logo`;
        logo.loading = "lazy";
        logo.decoding = "async";
        titleWrap.appendChild(logo);
      }
      const title = createEl("h4", "project-title", project.name);
      titleWrap.appendChild(title);
      top.appendChild(titleWrap);
      if (safeLink(project.url)) top.appendChild(externalLink("Open ↗", project.url));
      card.appendChild(top);
      card.appendChild(createEl("p", "project-description", project.summary));

      const ul = createEl("ul", "bullet-list");
      project.bullets.forEach((bullet) => ul.appendChild(createEl("li", "", bullet)));
      card.appendChild(ul);

      const gallery = createProjectGallery(project);
      if (gallery) card.appendChild(gallery);

      const tags = createEl("div", "tags");
      project.stack.forEach((item) => tags.appendChild(createEl("span", "tag", item)));
      card.appendChild(tags);
      list.appendChild(card);
    });
  }

  function initSkills() {
    const list = qs("#skillsList");
    data.skills.forEach((group) => {
      const card = createEl("article", "skill-card");
      card.appendChild(createEl("h4", "", group.title));
      if (group.summary) card.appendChild(createEl("p", "skill-summary", group.summary));
      const ul = createEl("ul", "skill-list");
      group.items.forEach((item) => ul.appendChild(createEl("li", "", item)));
      card.appendChild(ul);
      list.appendChild(card);
    });
  }

  function initSidebarSections() {
    const certifications = qs("#certificationsList");
    data.certifications.forEach((cert) => {
      const item = createEl("article", "stack-item cert-card");
      const certStatus = String(cert.status || "").toLowerCase();
      const isAchieved = certStatus === "achieved";
      const isInProgress = certStatus === "in progress";
      const defaultMetaValues = new Set(["credential achieved", "in progress"]);
      const metaValue = String(cert.meta || "").trim();
      const normalizedMetaValue = metaValue.toLowerCase();
      let metaRowText = cert.issuer;
      if (isAchieved && cert.credentialId) {
        metaRowText = `Credential ID: ${cert.credentialId}`;
      } else if (isInProgress) {
        metaRowText = "In progress";
      } else if (metaValue && !defaultMetaValues.has(normalizedMetaValue)) {
        metaRowText = `${cert.issuer} · ${metaValue}`;
      }

      const top = createEl("div", "cert-top");
      const brand = createEl("div", "cert-brand");
      const brandLogo = createEl("img", "cert-brand-icon");
      brandLogo.src = cert.brandLogo || "assets/microsoft-svgrepo-com.svg";
      brandLogo.alt = "";
      brandLogo.setAttribute("aria-hidden", "true");
      brandLogo.loading = "lazy";
      brandLogo.decoding = "async";
      brand.appendChild(brandLogo);
      brand.appendChild(createEl("span", "cert-brand-text", "Microsoft Certified"));
      top.appendChild(brand);

      const topRight = createEl("div", "cert-top-right");
      if (isAchieved) {
        const viewUrl = safeLink(cert.url) ? cert.url : cert.badge;
        if (safeLink(viewUrl)) {
          const action = createEl("a", "btn btn-secondary cert-action cert-action--top", "Show certification");
          action.href = viewUrl;
          action.target = "_blank";
          action.rel = "noreferrer";
          topRight.appendChild(action);
        }
      } else if (cert.status && !isInProgress) {
        const statusClass = cert.status.toLowerCase().replace(/\s+/g, "-");
        topRight.appendChild(createEl("span", `cert-status cert-status--${statusClass}`, cert.status));
      }
      top.appendChild(topRight);

      const body = createEl("div", "cert-body");
      if (cert.badge) {
        const badge = createEl("img", "cert-badge");
        badge.src = cert.badge;
        badge.alt = `${cert.title} badge`;
        badge.loading = "lazy";
        badge.decoding = "async";
        body.appendChild(badge);
      }

      const info = createEl("div", "cert-info");
      info.appendChild(createEl("h4", "", cert.title));
      info.appendChild(createEl("div", "meta-row", metaRowText));
      if (cert.note) info.appendChild(createEl("p", "cert-note", cert.note));

      body.appendChild(info);
      item.append(top, body);
      certifications.appendChild(item);
    });

    const additionalCertifications = qs("#additionalCertificationsList");
    if (additionalCertifications && Array.isArray(data.additionalCertifications)) {
      data.additionalCertifications.forEach((cert) => {
        const card = createEl("article", "micro-cert-card");

        const head = createEl("div", "micro-cert-head");
        if (cert.logo) {
          const logo = createEl("img", "micro-cert-logo");
          logo.src = cert.logo;
          logo.alt = `${cert.issuer} logo`;
          logo.loading = "lazy";
          logo.decoding = "async";
          head.appendChild(logo);
        }
        head.appendChild(createEl("h4", "", cert.title));
        card.appendChild(head);

        card.appendChild(createEl("div", "meta-row", `${cert.issuer} · Issued ${cert.issued}`));
        card.appendChild(createEl("div", "micro-cert-id", `Credential ID: ${cert.credentialId}`));

        if (safeLink(cert.url)) {
          const link = createEl("a", "micro-cert-action", "Show credential");
          link.href = cert.url;
          link.target = "_blank";
          link.rel = "noreferrer";
          card.appendChild(link);
        } else {
          card.appendChild(createEl("span", "micro-cert-action micro-cert-action--disabled", "Show credential"));
        }

        additionalCertifications.appendChild(card);
      });
    }

    const education = qs("#educationList");
    data.education.forEach((edu) => {
      const item = createEl("article", "stack-item");
      item.appendChild(createEl("h4", "", edu.title));
      item.appendChild(createEl("div", "meta-row", `${edu.subtitle} · ${edu.meta}`));
      item.appendChild(createEl("p", "", edu.detail));
      if (safeLink(edu.url)) item.appendChild(externalLink(edu.url.replace(/^https?:\/\//, ""), edu.url));
      education.appendChild(item);
    });

    const contacts = qs("#contactActions");
    const contactIconFallback = {
      email: "assets/gmail-svgrepo-com.svg",
      phone: "assets/phone-rounded-svgrepo-com.svg",
      github: "assets/github-142-svgrepo-com.svg"
    };
    data.contactCards.forEach((entry) => {
      const a = createEl("a", "contact-action");
      a.href = entry.url;
      a.target = entry.url.startsWith("http") ? "_blank" : "_self";
      if (entry.url.startsWith("http")) a.rel = "noreferrer";

      const iconWrap = createEl("span", "contact-icon-wrap");
      const icon = createEl("img", "contact-icon");
      const fallbackKey = String(entry.title || "").toLowerCase();
      icon.src = entry.icon || contactIconFallback[fallbackKey] || "";
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      iconWrap.appendChild(icon);

      const textWrap = createEl("span", "contact-text-wrap");
      textWrap.appendChild(createEl("strong", "", entry.title));
      textWrap.appendChild(createEl("span", "contact-value", entry.value));
      if (entry.note) textWrap.appendChild(createEl("span", "contact-note", entry.note));

      a.append(iconWrap, textWrap);
      contacts.appendChild(a);
    });
  }

  function renderResumeMarkup() {
    const profileIconMap = {
      github: "assets/github-142-svgrepo-com.svg",
      linkedin: "assets/linkedin-svgrepo-com.svg",
      topzonal: "assets/topzonal-logo.webp"
    };
    const profileLinks = data.links.map((item) => {
      const iconPath = profileIconMap[String(item.label || "").toLowerCase()] || "";
      const iconMarkup = iconPath ? `<img class="resume-link-icon" src="${iconPath}" alt="" aria-hidden="true" />` : "";
      if (safeLink(item.url)) {
        return `<a class="resume-link-pill" href="${item.url}" target="_blank" rel="noreferrer">${iconMarkup}<span>${item.label}: ${item.value}</span></a>`;
      }
      return `<span class="resume-link-pill">${iconMarkup}<span>${item.label}: ${item.value}</span></span>`;
    }).join("");
    const displayUrl = (url) => String(url || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    const pdfSiteUrl = data.siteMeta?.siteUrl || "https://albertomitroi.github.io/";
    const pdfLastUpdated = getResumeLastUpdatedLabel();
    const generatedLabel = pdfLastUpdated
      ? `Last updated: ${pdfLastUpdated} · View latest CV on`
      : "View latest CV on";
    const resumeGeneratedBar = `
      <div class="resume-generated-bar">
        <span>${generatedLabel}</span>
        <a href="${pdfSiteUrl}" target="_blank" rel="noreferrer">${displayUrl(pdfSiteUrl)}</a>
      </div>
    `;
    const resumeRoleBulletLimit = 4;
    const resumeSkillItemLimit = 6;
    const resumeContactItems = [
      { text: data.personal.location, icon: "assets/location-pin-svgrepo-com.svg", href: "" },
      { text: data.personal.phone, icon: "assets/phone-rounded-svgrepo-com.svg", href: `tel:${data.personal.phone.replace(/\s+/g, "")}` },
      { text: data.personal.email, icon: "assets/gmail-svgrepo-com.svg", href: `mailto:${data.personal.email}` }
    ];
    const resumeContactHtml = resumeContactItems.map((item) => {
      const icon = `<img class="resume-contact-icon" src="${item.icon}" alt="" aria-hidden="true" />`;
      if (safeLink(item.href)) {
        return `<a class="resume-contact-item" href="${item.href}">${icon}<span>${item.text}</span></a>`;
      }
      return `<span class="resume-contact-item">${icon}<span>${item.text}</span></span>`;
    }).join("");

    const groupedExperience = groupExperienceByCompany(data.experience);
    const experienceHtml = groupedExperience.map((group) => {
      const companyPeriod = buildCompanyPeriod(group.roles);
      const companyDuration = buildCompanyDuration(group.roles);
      const companyMeta = [companyPeriod, companyDuration].filter(Boolean).join(" · ");
      const companyLocations = [...new Set(group.roles.map((role) => role.location).filter(Boolean))];
      const companyLocation = companyLocations.join(" · ");
      const roleHtml = group.roles.map((role) => `
        <div class="resume-role-block">
          <div class="resume-role-head">
            <strong>${role.role}</strong>
            <span class="resume-small">${role.period}</span>
          </div>
          <p>${role.intro}</p>
          <ul>${role.bullets.slice(0, resumeRoleBulletLimit).map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
        </div>
      `).join("");

      return `
        <article class="resume-entry">
          <div class="resume-entry-head">
            <div class="resume-heading-brand">
              ${group.companyLogo ? `<img class="resume-inline-logo resume-inline-logo--company" src="${group.companyLogo}" alt="${group.company} logo" />` : ""}
              <div>
                <strong>${group.company}</strong>
                <div class="resume-subline">${companyMeta}</div>
                ${safeLink(group.website) ? `<div class="resume-small"><a href="${group.website}" target="_blank" rel="noreferrer">${displayUrl(group.website)}</a></div>` : ""}
              </div>
            </div>
            <div class="resume-small resume-right">${companyLocation}</div>
          </div>
          ${roleHtml}
        </article>
      `;
    }).join("");

    const projectHtml = data.projects.map((project) => `
      <article class="resume-project">
        <div class="resume-project-head">
          <div class="resume-heading-brand">
            ${project.logo ? `<img class="resume-inline-logo resume-inline-logo--project" src="${project.logo}" alt="${project.name} logo" />` : ""}
            <div>
              <strong>${project.name}</strong>
              ${safeLink(project.url) ? `<div class="resume-small"><a href="${project.url}" target="_blank" rel="noreferrer">${displayUrl(project.url)}</a></div>` : ""}
            </div>
          </div>
        </div>
        <div class="resume-summary resume-summary--compact"><p>${project.summary}</p></div>
        <ul>${project.bullets.slice(0, 3).map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
        <div class="resume-tags">${project.stack.slice(0, 10).join(" • ")}</div>
      </article>
    `).join("");

    const skillsHtml = data.skills.map((group) => `
      <div class="resume-skill-group">
        <strong>${group.title}</strong>
        <div class="resume-skills-list">${group.items.slice(0, resumeSkillItemLimit).join(" • ")}</div>
      </div>
    `).join("");

    const certHtml = data.certifications.map((cert) => {
      const certStatusClass = `resume-cert-status resume-cert-status--${String(cert.status || "").toLowerCase().replace(/\s+/g, "-")}`;
      const certStatus = String(cert.status || "").toLowerCase();
      const isAchieved = certStatus === "achieved";
      const isInProgress = certStatus === "in progress";
      const defaultMetaValues = new Set(["credential achieved", "in progress"]);
      const metaValue = String(cert.meta || "").trim();
      const normalizedMetaValue = metaValue.toLowerCase();
      let metaLine = cert.issuer;
      if (isAchieved && cert.credentialId) {
        metaLine = `Credential ID: ${cert.credentialId}`;
      } else if (isInProgress) {
        metaLine = "In progress";
      } else if (metaValue && !defaultMetaValues.has(normalizedMetaValue)) {
        metaLine = `${cert.issuer} · ${metaValue}`;
      }
      return `
      <div class="resume-cert-row">
        <div class="resume-cert-head">
          <div class="resume-cert-core">
            ${cert.badge ? `<img class="resume-inline-logo resume-inline-logo--badge" src="${cert.badge}" alt="${cert.title} badge" />` : ""}
            <div class="resume-cert-main">
              <div class="resume-cert-title-row">
                <div class="resume-cert-brand">
                  ${cert.brandLogo ? `<img class="resume-inline-logo resume-inline-logo--mini" src="${cert.brandLogo}" alt="${cert.issuer} logo" />` : ""}
                  <span>${cert.issuer}</span>
                </div>
                <strong>${cert.title}</strong>
              </div>
              <div class="resume-subline">${metaLine}</div>
            </div>
          </div>
          <div class="resume-small resume-right resume-cert-side">
            ${isAchieved && safeLink(cert.url) ? `<a class="resume-credential-link resume-credential-link--top" href="${cert.url}" target="_blank" rel="noreferrer">Show certification</a>` : ""}
            ${!isAchieved && !isInProgress && cert.status ? `<span class="${certStatusClass}">${cert.status}</span>` : ""}
          </div>
        </div>
        ${cert.note ? `<div class="resume-small resume-cert-note">${cert.note}</div>` : ""}
      </div>
    `;
    }).join("");
    const additionalCertHtml = (data.additionalCertifications || []).map((cert) => `
      <li class="resume-extra-cert-item">
        <div class="resume-extra-cert-head">
          ${cert.logo ? `<img class="resume-inline-logo resume-inline-logo--mini" src="${cert.logo}" alt="${cert.issuer} logo" />` : ""}
          <div>
            <strong>${cert.title}</strong> · ${cert.issuer} (${cert.issued})${cert.credentialId ? ` · Credential ID: ${cert.credentialId}` : ""}
          </div>
        </div>
        ${safeLink(cert.url) ? `<a class="resume-credential-link resume-credential-link--small" href="${cert.url}" target="_blank" rel="noreferrer">Show credential</a>` : ""}
      </li>
    `).join("");

    const renderEducationRow = (edu) => `
      <div class="resume-edu-row">
        <div class="resume-edu-head">
          <div>
            <strong>${edu.title}</strong>
            <div class="resume-subline">${edu.subtitle}</div>
            ${safeLink(edu.url) ? `<div class="resume-small"><a href="${edu.url}" target="_blank" rel="noreferrer">${displayUrl(edu.url)}</a></div>` : ""}
          </div>
          <div class="resume-small resume-right">
            <div><strong>${edu.meta}</strong></div>
            <div>${edu.detail}</div>
          </div>
        </div>
      </div>
    `;
    const primaryEducation = (data.education && data.education.length) ? data.education[0] : null;
    const primaryEducationHtml = primaryEducation
      ? `<section class="resume-section resume-section--primary-education"><h2 class="resume-title">Education</h2>${renderEducationRow(primaryEducation)}</section>`
      : "";
    const resumeEndNote = `
      <div class="resume-site-footer-note">
        <span>This PDF is a snapshot generated in ${pdfLastUpdated || "the latest update cycle"}.</span>
        <span>For the most up-to-date CV, complete project galleries, live certifications, and contact links, visit</span>
        <a href="${pdfSiteUrl}" target="_blank" rel="noreferrer">${displayUrl(pdfSiteUrl)}</a>
      </div>
    `;

    return `
      <div class="resume-shell">
        ${resumeGeneratedBar}
        <header class="resume-header">
          <div class="resume-photo"><img src="${data.personal.image}" alt="${data.personal.name} profile portrait" /></div>
          <div>
            <h1 class="resume-name">${data.personal.name}</h1>
            <p class="resume-role">${data.personal.role}</p>
            <p class="resume-tagline">${data.personal.headline}</p>
            <div class="resume-contact">${resumeContactHtml}</div>
            <div class="resume-profile-row">${profileLinks}</div>
            <div class="resume-facts">${data.heroFacts.map((fact) => `<span class="resume-fact">${fact}</span>`).join("")}</div>
          </div>
        </header>

        <section class="resume-section">
          <h2 class="resume-title">Professional Summary</h2>
          <div class="resume-summary">${data.summary.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>
          <div class="resume-keyline">${(data.aboutHighlights || []).slice(0, 4).join(" • ")}</div>
        </section>

        <section class="resume-section"><h2 class="resume-title">Experience</h2>${experienceHtml}</section>
        ${primaryEducationHtml}
        <section class="resume-section resume-section--projects"><h2 class="resume-title">Projects</h2>${projectHtml}</section>
        <section class="resume-section">
          <h2 class="resume-title">Certifications</h2>
          ${certHtml}
          ${additionalCertHtml ? `<div class="resume-cert-subtitle">Additional AI Certifications</div><ul class="resume-extra-certs">${additionalCertHtml}</ul>` : ""}
        </section>
        <section class="resume-section"><h2 class="resume-title">Core Skills</h2><div class="resume-skills-grid">${skillsHtml}</div></section>
        ${resumeEndNote}
      </div>
    `;
  }

  function initResume() {
    qs("#resumePdfRoot").innerHTML = renderResumeMarkup();
  }

  function bindActions() {
    ["#downloadPdfHeader", "#downloadPdfHero", "#downloadPdfFooter"].forEach((selector) => {
      const button = qs(selector);
      if (!button) return;
      button.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = "assets/CV_AlbertoMitroi.pdf";
        link.download = "CV_AlbertoMitroi.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
    });
  }

  function initMobileMenu() {
    const header = qs(".site-header");
    const nav = qs("#mainNav");
    const toggle = qs("#navToggle");
    if (!header || !nav || !toggle) return;

    const mobileQuery = window.matchMedia("(max-width: 980px)");
    const isMenuOpen = () => header.classList.contains("nav-open");

    function setMenu(open) {
      if (open && mobileQuery.matches) {
        header.classList.add("nav-open");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    }

    toggle.addEventListener("click", () => setMenu(!isMenuOpen()));

    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("click", (event) => {
      if (!mobileQuery.matches || !isMenuOpen()) return;
      if (header.contains(event.target)) return;
      setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    const syncOnResize = () => {
      if (!mobileQuery.matches) setMenu(false);
    };
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncOnResize);
    } else {
      window.addEventListener("resize", syncOnResize);
    }
  }

  function getSectionScrollTarget(section) {
    if (!section) return null;
    const heading = section.querySelector(".section-heading");
    return heading || section;
  }

  function scrollToSection(sectionId, updateHash = true, behavior = "smooth") {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const target = getSectionScrollTarget(section);
    if (!target) return;

    const header = document.querySelector(".site-header");
    const headerOffset = (header ? header.offsetHeight : 0) + 14;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerOffset);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resolvedBehavior = prefersReducedMotion ? "auto" : behavior;

    window.scrollTo({ top, behavior: resolvedBehavior });

    if (updateHash && history.replaceState) {
      history.replaceState(null, "", `#${sectionId}`);
    }
  }

  function initNavigation() {
    const nav = qs("#mainNav");
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;
    const sectionIndicator = qs("#mobileSectionIndicator");
    const sectionIndicatorLabel = qs("#mobileSectionIndicatorLabel");

    const refs = links
      .map((link) => {
        const href = link.getAttribute("href") || "";
        const id = href.startsWith("#") ? href.slice(1) : "";
        const section = id ? document.getElementById(id) : null;
        if (!section) return null;
        return { link, id, section };
      })
      .filter(Boolean);

    if (!refs.length) return;

    let activeId = "";
    function getIndicatorText(id) {
      if (!id) return "";
      const activeRef = refs.find((ref) => ref.id === id);
      return activeRef ? activeRef.link.textContent.trim() : "";
    }

    function syncIndicator(id) {
      if (!sectionIndicatorLabel) return;
      const text = getIndicatorText(id);
      sectionIndicatorLabel.textContent = text;
      if (sectionIndicator) sectionIndicator.classList.toggle("is-empty", !text);
    }

    function setActive(id) {
      if (activeId === id) return;
      activeId = id;
      refs.forEach((ref) => ref.link.classList.toggle("is-active", !!id && ref.id === id));
      syncIndicator(id);
    }

    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const sectionId = href.slice(1);
      if (!sectionId || !document.getElementById(sectionId)) return;

      link.addEventListener("click", (event) => {
        event.preventDefault();
        setActive(sectionId);
        scrollToSection(sectionId, true, "smooth");
      });
    });

    function resolveActiveSectionId() {
      const header = document.querySelector(".site-header");
      const pivot = window.scrollY + (header ? header.offsetHeight : 0) + 24;
      const firstTop = refs[0].section.offsetTop;
      if (pivot < firstTop - 20) return "";
      let current = refs[0].id;

      refs.forEach((ref) => {
        if (ref.section.offsetTop <= pivot) current = ref.id;
      });

      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
      if (nearBottom) current = refs[refs.length - 1].id;
      return current;
    }

    let rafId = 0;
    function scheduleActiveUpdate() {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        setActive(resolveActiveSectionId());
      });
    }

    window.addEventListener("scroll", scheduleActiveUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveUpdate);
    syncIndicator("");
    scheduleActiveUpdate();

    const hashId = window.location.hash.replace(/^#/, "");
    if (hashId && refs.some((ref) => ref.id === hashId)) {
      window.requestAnimationFrame(() => scrollToSection(hashId, false, "auto"));
    }
  }

  function initSectionHeadingReveal() {
    const headings = Array.from(document.querySelectorAll(".section-heading"));
    if (!headings.length) return;

    document.body.classList.add("js-enhanced");
    headings.forEach((heading, index) => {
      const delayStep = (index % 4) * 0.04;
      heading.style.setProperty("--reveal-delay", `${delayStep}s`);
    });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      headings.forEach((heading) => heading.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    }, {
      threshold: [0, 0.15, 0.3, 0.45, 0.6],
      rootMargin: "-4% 0px -12% 0px"
    });

    headings.forEach((heading) => observer.observe(heading));
  }

  async function init() {
    document.body.classList.add("is-loading");
    initAppLoader();

    try {
      initSiteMeta();
      initHero();
      initAbout();
      initExperience();
      initProjects();
      initSkills();
      initSidebarSections();
      initResume();
      bindActions();
      initMobileMenu();
      initNavigation();
      initSectionHeadingReveal();
    } catch (error) {
      console.error(error);
    } finally {
      await revealPageWhenReady();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    void init();
  });
})();
