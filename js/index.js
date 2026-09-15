/* ============================================================
   ১. "See More / See Less" বাটন
   ------------------------------------------------------------
   কাজ: প্রতিটা .custom-card এর ভিতরে থাকা লম্বা description
   (p.text-muted) টেক্সট প্রথমে ৪ লাইনে ছেঁটে (clamp) দেখায়,
   এবং নিচে একটা "See More" বাটন বসিয়ে দেয়।
   বাটনে ক্লিক করলে টেক্সট পুরোটা দেখায় (See Less) আবার
   ক্লিক করলে আগের মতো ছোট হয়ে যায়।
   ============================================================ */
function initExpandableDescriptions(scope) {
  (scope || document).querySelectorAll(".custom-card p.text-muted").forEach((description) => {
    // ছোট অবস্থায় (৪ লাইন clamp) রাখার জন্য ক্লাস যোগ করা হচ্ছে
    description.classList.add("expandable-description");

    // "See More" বাটন dynamically তৈরি করা হচ্ছে
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "see-more-btn";
    toggleButton.textContent = "See More";
    toggleButton.setAttribute("aria-expanded", "false");

    // description এর ঠিক পরেই বাটনটা বসানো হচ্ছে
    description.insertAdjacentElement("afterend", toggleButton);

    // ক্লিক করলে expand/collapse টগল হবে
    toggleButton.addEventListener("click", () => {
      const isExpanded = description.classList.toggle("is-expanded");
      toggleButton.textContent = isExpanded ? "See Less" : "See More";
      toggleButton.setAttribute("aria-expanded", String(isExpanded));
    });
  });
}

/* ============================================================
   ২. Dark Mode Toggle
   ------------------------------------------------------------
   কাজ: navbar এর গোল বাটনে (#darkModeToggle) ক্লিক করলে
   পুরো সাইট Light <-> Dark থিমের মধ্যে টগল হয়।
   পছন্দটা localStorage এ সেভ থাকে, তাই পেজ রিফ্রেশ বা
   অন্য পেজে গেলেও একই থিম মনে থাকে।
   ============================================================ */
(function () {
  var STORAGE_KEY = "theme"; // localStorage এ থিম সেভ রাখার key

  // আগে সেভ করা থিম (dark/light) localStorage থেকে পড়া হচ্ছে
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // private/incognito browsing এ localStorage ব্লক থাকতে পারে
      return null;
    }
  }

  // নতুন থিম localStorage এ সেভ করা হচ্ছে
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // localStorage কাজ না করলেও যেন পুরো স্ক্রিপ্ট ভেঙে না পড়ে
    }
  }

  // <html> ট্যাগে data-theme="dark" বসিয়ে/সরিয়ে থিম পাল্টানো হয়
  // (CSS এ [data-theme="dark"] সিলেক্টর দিয়ে রঙ পরিবর্তন হয়)
  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  // toggle বাটনে ক্লিক ইভেন্ট বসানো হচ্ছে
  function initToggle() {
    var toggleBtn = document.getElementById("darkModeToggle");
    if (!toggleBtn) {
      // এই পেজে টগল বাটন না থাকলে সতর্ক বার্তা (ভুল খুঁজতে সাহায্য করবে)
      console.warn("Dark mode: #darkModeToggle button not found on this page.");
      return;
    }

    toggleBtn.addEventListener("click", function () {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      var newTheme = isDark ? "light" : "dark";
      applyTheme(newTheme);
      saveTheme(newTheme);
    });
  }

  // script কে body এর শেষে রাখলেও যেন সমস্যা না হয়,
  // তাই DOM রেডি কিনা চেক করে তারপর initToggle() চালানো হচ্ছে
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initToggle);
  } else {
    initToggle();
  }
})();

/* ============================================================
   ৩. মাউস কার্সার Smoke/Particle Effect
   ------------------------------------------------------------
   কাজ: মাউস যেদিকে যায়, সেদিকে হালকা বেগুনি "smoke" কণা
   (particle) তৈরি হয়ে আস্তে আস্তে মিলিয়ে যায়, আর একটা
   glowing রিং (cursor-ring) কার্সারকে নরমভাবে follow করে।

   এই ইফেক্ট শুধু মাউসযুক্ত ডিভাইসে (ডেস্কটপ/ল্যাপটপ) চলে —
   টাচ ডিভাইস আর "reduce motion" preference থাকলে বন্ধ থাকে।
   ============================================================ */
(function () {
  // শুধু "real mouse" থাকা ডিভাইসেই ইফেক্ট চালু হবে (মোবাইল/ট্যাব বাদ)
  const canUseCursorTrail = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // ইউজার যদি সিস্টেমে "reduce motion" চালু রাখে, তাহলে animation বন্ধ রাখা হচ্ছে
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canUseCursorTrail || reducedMotion) return;

  // ---- ইফেক্টের জন্য প্রয়োজনীয় HTML এলিমেন্ট তৈরি ----

  // সব particle আর ring রাখার জন্য একটা fixed, full-screen container
  const container = document.createElement("div");
  container.className = "cursor-smoke-container";
  container.setAttribute("aria-hidden", "true"); // স্ক্রিন রিডারের জন্য এটা গুরুত্বপূর্ণ না
  document.body.appendChild(container);

  // কার্সারকে follow করা glowing রিং
  const cursorRing = document.createElement("span");
  cursorRing.className = "cursor-ring";
  container.appendChild(cursorRing);

  // ---- অবস্থা (state) রাখার ভ্যারিয়েবলগুলো ----
  const particles = []; // এই মুহূর্তে স্ক্রিনে থাকা সব smoke particle
  let ringX = 0,
    ringY = 0; // রিং এর বর্তমান পজিশন
  let targetX = 0,
    targetY = 0; // মাউসের আসল (target) পজিশন
  let lastX = 0,
    lastY = 0; // আগের মাউস পজিশন (দূরত্ব হিসাব করতে লাগে)
  let hasPointer = false; // মাউস অন্তত একবার নড়েছে কিনা
  let animationFrame = 0; // particle animation এর requestAnimationFrame id
  let ringFrame = 0; // ring animation এর requestAnimationFrame id

  // রিংটা মাউসের পিছু পিছু "smooth/lag" করে যায় (easing effect)
  function followCursor() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    ringFrame = requestAnimationFrame(followCursor);
  }
  followCursor(); // পেজ লোড হওয়ার সাথে সাথেই রিং অ্যানিমেশন শুরু

  // মাউস পজিশনে একটা নতুন smoke particle যোগ করা হয়
  function addParticle(x, y, velocity) {
    if (particles.length >= 24) return; // পারফরম্যান্সের জন্য সর্বোচ্চ ২৪টা particle

    const element = document.createElement("span");
    element.className = "cursor-smoke-particle";

    const size = 7 + Math.random() * 9; // random সাইজ (৭-১৬px)
    const life = 420 + Math.random() * 260; // random আয়ু (মিলিসেকেন্ডে)

    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    container.appendChild(element);

    particles.push({
      element,
      x: x - size / 2,
      y: y - size / 2,
      started: performance.now(),
      life,
      driftX: (Math.random() - 0.5) * (0.35 + velocity * 0.05), // এলোমেলো পাশে সরে যাওয়া
      driftY: -0.1 - Math.random() * 0.35, // ধোঁয়ার মতো উপরে উঠে যাওয়া
      rotation: (Math.random() - 0.5) * 20, // হালকা ঘোরা
    });
  }

  // প্রতিটা particle-কে frame-by-frame আপডেট করে (move + fade + scale)
  // আয়ু শেষ হয়ে গেলে DOM থেকে সরিয়ে দেয়
  function animate(now) {
    particles.forEach((particle, index) => {
      const progress = (now - particle.started) / particle.life; // ০ থেকে ১

      if (progress >= 1) {
        particle.element.remove();
        particles.splice(index, 1);
        return;
      }

      particle.x += particle.driftX;
      particle.y += particle.driftY;

      const scale = 0.75 + progress * 1.1; // সময়ের সাথে বড় হয়
      const opacity = 0.24 * (1 - progress) ** 1.5; // সময়ের সাথে মিলিয়ে যায়

      particle.element.style.opacity = opacity;
      particle.element.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) scale(${scale}) rotate(${particle.rotation * progress}deg)`;
    });

    // particle থাকলে animation চালু রাখো, না থাকলে বন্ধ করে দাও (পারফরম্যান্স বাঁচাতে)
    animationFrame = particles.length ? requestAnimationFrame(animate) : 0;
  }

  // মাউস নড়াচড়া করলে এই ইভেন্ট চলে
  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;

      // প্রথমবার মাউস নড়লে রিংকে সাথে সাথে সেই পজিশনে বসিয়ে দেখানো শুরু করা
      if (!hasPointer) {
        ringX = targetX;
        ringY = targetY;
        cursorRing.classList.add("is-visible");
      }

      const distance = hasPointer ? Math.hypot(event.clientX - lastX, event.clientY - lastY) : 0;

      if (!hasPointer) {
        hasPointer = true;
        lastX = event.clientX;
        lastY = event.clientY;
        return;
      }

      // খুব সামান্য নড়াচড়ায় particle তৈরি না করে পারফরম্যান্স বাঁচানো হচ্ছে
      if (distance < 5) return;

      lastX = event.clientX;
      lastY = event.clientY;

      addParticle(event.clientX, event.clientY, Math.min(distance, 40));

      // animation loop বন্ধ থাকলে আবার চালু করা
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    },
    { passive: true },
  );
})();

/* ============================================================
   ৪. Projects Section — Dynamic Cards + Pagination
   ------------------------------------------------------------
   সব প্রজেক্ট এই PROJECTS অ্যারেতে ডেটা হিসেবে রাখা আছে।
   নতুন প্রজেক্ট যোগ করতে চাইলে শুধু এই অ্যারেতে একটা অবজেক্ট
   যোগ করলেই হবে — pagination নিজে থেকেই পেজ সংখ্যা হিসাব করে
   নেবে এবং প্রতি পেজে PAGE_SIZE (৬টা) করে কার্ড দেখাবে।

   #projectsGrid বা #projectsPagination না থাকলে (যেমন about.html
   পেজে) কিছুই না করে থেমে যায়।
   ============================================================ */
(function () {
  const PROJECTS = [
    {
      logo: "https://shops-mehadee-hassan.vercel.app/assets/Logo-BPTDrPQZ.png",
      alt: "Shops",
      title: "Shops",
      description:
        "এটি একটি আধুনিক ফুল-স্ট্যাক ই-কমার্স প্ল্যাটফর্ম, যেখানে গ্রাহকরা সহজে প্রোডাক্ট ব্রাউজ, সার্চ ও অর্ডার করতে পারেন, আর অ্যাডমিনরা একটি সুরক্ষিত ড্যাশবোর্ড থেকে পুরো ইনভেন্টরি নিয়ন্ত্রণ করতে পারেন। ফ্রন্টএন্ড তৈরি হয়েছে React ও Redux Toolkit দিয়ে, যেখানে Tailwind CSS ব্যবহার করে একটি ক্লিন ও রেসপনসিভ ইউজার ইন্টারফেস ডিজাইন করা হয়েছে। ব্যাকএন্ড Node.js, Express ও Sequelize ORM দিয়ে তৈরি, MySQL ডাটাবেসের সাথে সংযুক্ত এবং JWT-ভিত্তিক অথেন্টিকেশন সিস্টেম ব্যবহার করে অ্যাডমিন ও ইউজার অ্যাক্সেস নিয়ন্ত্রণ করা হয়। প্রোডাক্ট ইমেজ আপলোড ও ম্যানেজমেন্টের জন্য Cloudinary ব্যবহার করা হয়েছে, এবং প্রজেক্টটি Render ও Vercel-এ ডিপ্লয় করে ক্লাউড-হোস্টেড MySQL ডাটাবেসের (Aiven) সাথে যুক্ত করা হয়েছে।",
      link: "https://shops-mehadee-hassan.vercel.app",
    },
    {
      logo: "/images/favicon.svg",
      alt: "Dev Stack logo",
      title: "Dev Stack",
      description:
        "এটি একটি আধুনিক এবং ইন্টারঅ্যাক্টিভ ডেভেলপার টেকনোলজি এক্সপ্লোরিং প্ল্যাটফর্ম, যেখানে ডেভেলপাররা Frontend, Backend, Database, Programming Language, Styling এবং DevOps-এর বিভিন্ন টেকনোলজি সম্পর্কে জানতে এবং নিজেদের পছন্দের টেকনোলজি দিয়ে একটি Personal Development Stack তৈরি করতে পারেন। প্রতিটি টেকনোলজির Rating ও Difficulty Level দেখার পাশাপাশি পছন্দের টেকনোলজি সহজেই Stack-এ যুক্ত এবং ম্যানেজ করা যায়। প্রজেক্টটি React.js দিয়ে তৈরি করা হয়েছে এবং Local JSON Dataset ব্যবহার করে ডায়নামিকভাবে টেকনোলজি ডেটা প্রদর্শন করা হয়েছে। Responsive Design, Reusable Components এবং Interactive UI-এর মাধ্যমে ডেভেলপারদের জন্য একটি সহজ, দ্রুত ও সুন্দর user experience নিশ্চিত করা হয়েছে।",
      link: "https://dev-stack-eta.vercel.app/",
    },
    {
      logo: "https://bpl-dream11-two.vercel.app/assets/Group%201-DE68HT7x.png",
      alt: "BPL CricBid logo",
      title: "BPL CricBid",
      description:
        "এটি একটি আধুনিক এবং ইন্টারঅ্যাক্টিভ BPL Player Auction Management Web Application, যেখানে ব্যবহারকারীরা বিভিন্ন ক্রিকেটার সম্পর্কে বিস্তারিত তথ্য দেখতে এবং পছন্দের খেলোয়াড়দের একটি নির্দিষ্ট বাজেটের মধ্যে তাদের স্কোয়াডে যুক্ত করতে পারেন। প্রজেক্টটিতে Available Players ও Selected Players আলাদাভাবে ম্যানেজ করার সুবিধা রয়েছে এবং প্রতিটি খেলোয়াড়ের মূল্য ও নির্বাচনের তথ্য ডায়নামিকভাবে পরিচালনা করা হয়েছে। React.js এবং TypeScript ব্যবহার করে অ্যাপ্লিকেশনটি তৈরি করা হয়েছে, যেখানে Tailwind CSS দিয়ে রেসপনসিভ ও আধুনিক UI ডিজাইন করা হয়েছে। Player Selection, Budget Management, Toast Notification এবং Interactive Components-এর মাধ্যমে একটি বাস্তবসম্মত ক্রিকেট Player Auction-এর অভিজ্ঞতা দেওয়ার চেষ্টা করা হয়েছে।",
      link: "https://bpl-dream11-two.vercel.app/",
    },
    {
      logo: "/images/download.svg",
      alt: "Coding Mind logo",
      title: "Coding Mind",
      description: "এটি একটি আধুনিক এবং ফ্রি মক এপিআই (Mock API) ম্যানেজমেন্ট প্ল্যাটফর্ম। ফ্রন্টএন্ড এবং ব্যাকএন্ড ডেভেলপারদের কাজের গতি বাড়াতে এটি তৈরি করা হয়েছে। এর মাধ্যমে কোনো ব্যাকএন্ড কোড ছাড়াই আনলিমিটেড প্রজেক্ট ও এন্ডপয়েন্ট তৈরি করা, ডায়নামিক রেসপন্স কনফিগার করা, ফেক ডেটা জেনারেট করা এবং এরর/ডিলে সিমুলেট করার মতো দারুণ সব ফিচার ব্যবহার করা যায়। পুরো ল্যান্ডিং পেজটি Tailwind CSS দিয়ে চমৎকারভাবে ডিজাইন করা হয়েছে।",
      link: "https://coding-mind-mehadee-hassan.vercel.app/",
    },
    {
      logo: "/images/favicon-Bx60cIKr.png",
      alt: "Code Fight logo",
      title: "Code Fight",
      description: "এটি একটি আধুনিক ব্লগিং প্ল্যাটফর্ম যেখানে ব্যবহারকারীরা বিভিন্ন বিষয়ে ব্লগ পড়তে পারেন। এটি একটি ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন যা রেসপনসিভ ডিজাইনের মাধ্যমে তৈরি করা হয়েছে।",
      link: "https://blog-project-eight-pi.vercel.app/",
    },
    {
      logo: "https://nature-s-platter-three.vercel.app/img/Vector.png",
      alt: "Nature's Platter",
      title: "Nature's Platter",
      description: "এটি একটি ফ্রেশ ও অর্গানিক ফুড ল্যান্ডিং ও অর্ডার প্লেটফর্ম, যেখানে ব্যবহারকারীরা সহজে বিভিন্ন ফুড আইটেম ব্রাউজ করতে পারেন। এতে ফুড ক্যাটাগরি, আকর্ষণীয় হিরো ব্যানার ও প্রমোশনাল সেকশন রয়েছে। সম্পূর্ণ প্রজেক্টটি HTML, CSS এবং JavaScript দিয়ে রেসপনসিভ ও ক্লিন ইউআই ডিজাইনে তৈরি করা হয়েছে।",
      link: "https://nature-s-platter-three.vercel.app/",
    },
    {
      logo: "https://bpl-dream11-two.vercel.app/assets/Group%201-DE68HT7x.png",
      alt: "BPL Dream11",
      title: "BPL Dream11",
      description: "এটি একটি ইন্টারেক্টিভ ও ডায়নামিক ফ্যান্টাসি ক্রিকেট ওয়েব অ্যাপ্লিকেশন, যেখানে ইউজাররা তাদের পছন্দের বিপিএল খেলোয়াড়দের নিয়ে নিজস্ব একাদশ (Dream Team) গঠন করতে পারেন। অ্যাপ্লিকেশনে নির্দিষ্ট ভার্চুয়াল বাজেট সিস্টেম রয়েছে, যার মাধ্যমে প্লেয়ার সিলেক্ট ও রিমুভ করার সুযোগ রয়েছে। ফ্রন্টএন্ড তৈরিতে React, TypeScript এবং Tailwind CSS ব্যবহার করা হয়েছে, যা ওয়েবসাইটটিকে অত্যন্ত ফাস্ট ও রেসপনসিভ করেছে।",
      link: "https://bpl-dream11-two.vercel.app/",
    },
    {
      logo: "https://learn-with-mehedi.vercel.app/favicon.ico",
      alt: "Learn with Mehedi logo",
      title: "Learn with Mehedi",
      description: "এটি একটি ইন্টারঅ্যাক্টিভ ই-লার্নিং বা এডুকেশনাল প্ল্যাটফর্ম, যেখানে শিক্ষার্থীরা বিভিন্ন কোর্স এবং টিউটোরিয়াল অ্যাক্সেস করতে পারে। প্ল্যাটফর্মটি ব্যবহারকারী-বান্ধব ইন্টারফেস এবং ক্লিন নেভিগেশনের ওপর ভিত্তি করে তৈরি করা হয়েছে, যাতে শেখার অভিজ্ঞতা সহজ ও আনন্দদায়ক হয়। এটি মূলত আধুনিক ওয়েব টেকনোলজি ব্যবহার করে একটি দক্ষ লার্নিং ইকোসিস্টেম হিসেবে ডিজাইন করা।",
      link: "https://learn-with-mehedi.vercel.app/",
    },
    {
      logo: "/images/online-shop Background Removed copy.png",
      alt: "ReactMart logo",
      title: "ReactMart",
      description: "React.js দিয়ে তৈরি একটি আধুনিক এবং রেসপনসিভ ই-কমার্স ওয়েব অ্যাপ্লিকেশন। এই প্রজেক্টে প্রোডাক্ট লিস্টিং, ডায়নামিক প্রোডাক্ট ফিল্টারিং, কার্ট (Cart) ম্যানেজমেন্ট এবং একটি স্মুথ ইউজার ইন্টারফেস অন্তর্ভুক্ত রয়েছে। সিঙ্গেল পেজ অ্যাপ্লিকেশন (SPA) হিসেবে ব্যবহারকারীদের চমৎকার ও দ্রুত শপিং অভিজ্ঞতা দেওয়ার জন্য এটি ডিজাইন করা হয়েছে।",
      link: "https://ecommace-react-js.vercel.app/",
    },
    {
      logo: "https://bootstrap-ecommerce-silk.vercel.app/images/grocery%20logo%20Background%20Removed.png",
      alt: "metualogo",
      title: "Metua Grocery",
      description: "বর্তমান সময়ে অনলাইন শপিং আমাদের দৈনন্দিন জীবনের একটি অপরিহার্য অংশে পরিণত হয়েছে। সেই প্রয়োজনের প্রতি সাড়া দিয়ে Metua Grocery একটি আধুনিক এবং ব্যবহারবান্ধব প্ল্যাটফর্ম হিসেবে আত্মপ্রকাশ করেছে। এটি শুধু একটি সাধারণ অনলাইন মুদি দোকান নয়, বরং একটি এমন জায়গা যেখানে গ্রাহকরা সহজে এবং দ্রুত তাদের প্রয়োজনীয় পণ্যসমূহ অর্ডার করতে পারেন।",
      link: "https://bootstrap-ecommerce-silk.vercel.app/",
    },
    // নতুন প্রজেক্ট যোগ করতে হলে এখানে { logo, alt, title, description, link } অবজেক্ট যোগ করুন
  ];

  const PAGE_SIZE = 6;
  const grid = document.getElementById("projectsGrid");
  const paginationList = document.getElementById("projectsPagination");

  if (!grid || !paginationList) return;

  const totalPages = Math.max(1, Math.ceil(PROJECTS.length / PAGE_SIZE));
  let currentPage = 1;

  function createCard(project) {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 d-flex justify-content-center";
    col.innerHTML = '<div class="card custom-card text-start">' + '<div class="logo-area text-center">' + '<img src="' + project.logo + '" alt="' + project.alt + '" class="brand-logo" />' + "</div>" + '<h5 class="fw-bold mb-3">' + project.title + "</h5>" + '<p class="text-muted mb-4">' + project.description + "</p>" + '<div class="button-area">' + '<a href="' + project.link + '" target="_blank" rel="noopener noreferrer" class="btn-visit">ভিজিট করুন</a>' + "</div>" + "</div>";
    return col;
  }

  // অনেক পেজ থাকলে (৭+ পেজ) সব নাম্বার না দেখিয়ে current-এর আশেপাশে +
  // প্রথম/শেষ পেজ দেখানো হয়, বাকিটা "..." দিয়ে বোঝানো হয়
  function getVisiblePages(total, current) {
    const delta = 1;
    const pages = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        pages.push(i);
      }
    }
    const withDots = [];
    let prev = 0;
    pages.forEach((page) => {
      if (prev && page - prev === 2) withDots.push(prev + 1);
      else if (prev && page - prev > 2) withDots.push("...");
      withDots.push(page);
      prev = page;
    });
    return withDots;
  }

  function addPageItem(label, page, { active = false, disabled = false } = {}) {
    const li = document.createElement("li");
    li.className = "proj-page-item" + (active ? " active" : "") + (disabled ? " disabled" : "");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "proj-page-btn";
    btn.textContent = label;
    btn.disabled = disabled;
    if (active) btn.setAttribute("aria-current", "page");

    if (!disabled && !active) {
      btn.addEventListener("click", () => renderPage(page, true));
    }

    li.appendChild(btn);
    paginationList.appendChild(li);
  }

  function renderPagination() {
    paginationList.innerHTML = "";
    if (totalPages <= 1) return;

    addPageItem("«", currentPage - 1, { disabled: currentPage === 1 });

    getVisiblePages(totalPages, currentPage).forEach((page) => {
      if (page === "...") {
        addPageItem("...", null, { disabled: true });
      } else {
        addPageItem(String(page), page, { active: page === currentPage });
      }
    });

    addPageItem("»", currentPage + 1, { disabled: currentPage === totalPages });
  }

  function renderPage(page, isUserTriggered) {
    currentPage = Math.min(Math.max(page, 1), totalPages);
    grid.innerHTML = "";

    const start = (currentPage - 1) * PAGE_SIZE;
    PROJECTS.slice(start, start + PAGE_SIZE).forEach((project) => {
      grid.appendChild(createCard(project));
    });

    initExpandableDescriptions(grid); // নতুন কার্ডগুলোতে See More বাটন বসানো
    renderPagination();

    // ইউজার নিজে Prev/Next/নাম্বারে ক্লিক করলেই শুধু সেকশনের শুরুতে স্ক্রল হবে,
    // পেজ প্রথমবার লোড হওয়ার সময় (initial render) স্ক্রল জাম্প হবে না
    if (isUserTriggered) {
      const section = grid.closest(".main-container");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  renderPage(1, false);
})();
