/* ১. Project description-এর জন্য See More / See Less functionality */
function initExpandableDescriptions(scope) {
  (scope || document).querySelectorAll('.custom-card p.text-muted').forEach((description) => {
    description.classList.add('expandable-description');

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'see-more-btn';
    toggleButton.textContent = 'See More';
    toggleButton.setAttribute('aria-expanded', 'false');

    description.insertAdjacentElement('afterend', toggleButton);

    /* Description expand/collapse করার জন্য */
    toggleButton.addEventListener('click', () => {
      const isExpanded = description.classList.toggle('is-expanded');

      toggleButton.textContent = isExpanded ? 'See Less' : 'See More';
      toggleButton.setAttribute('aria-expanded', String(isExpanded));
    });
  });
}


/* ২. Dark Mode: theme change এবং localStorage-এ save করার জন্য */
(function () {
  var STORAGE_KEY = 'theme';

  /* Saved theme localStorage থেকে পাওয়ার জন্য */
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  /* Selected theme localStorage-এ save করার জন্য */
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  /* Selected theme HTML document-এ apply করার জন্য */
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  /* Dark Mode toggle button initialize করার জন্য */
  function initToggle() {
    var toggleBtn = document.getElementById('darkModeToggle');

    if (!toggleBtn) {
      console.warn('Dark mode: #darkModeToggle button not found on this page.');
      return;
    }

    /* Button click করলে Light/Dark theme পরিবর্তন করার জন্য */
    toggleBtn.addEventListener('click', function () {
      var isDark =
        document.documentElement.getAttribute('data-theme') === 'dark';

      var newTheme = isDark ? 'light' : 'dark';

      applyTheme(newTheme);
      saveTheme(newTheme);
    });
  }

  /* DOM load হওয়ার পর Dark Mode initialize করার জন্য */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }
})();


/* ৩. Cursor follow ring এবং smoke particle animation */
(function () {
  /* শুধু desktop/fine pointer device-এ effect চালানোর জন্য */
  const canUseCursorTrail = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  ).matches;

  /* User reduced motion prefer করলে animation বন্ধ রাখার জন্য */
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!canUseCursorTrail || reducedMotion) return;

  const container = document.createElement('div');
  container.className = 'cursor-smoke-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  const cursorRing = document.createElement('span');
  cursorRing.className = 'cursor-ring';
  container.appendChild(cursorRing);

  const particles = [];

  let ringX = 0,
    ringY = 0;

  let targetX = 0,
    targetY = 0;

  let lastX = 0,
    lastY = 0;

  let hasPointer = false;
  let animationFrame = 0;
  let ringFrame = 0;


  /* Cursor ring-কে smoothly mouse position-এর সাথে move করার জন্য */
  function followCursor() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;

    cursorRing.style.transform =
      `translate3d(${ringX}px, ${ringY}px, 0)`;

    ringFrame = requestAnimationFrame(followCursor);
  }

  followCursor();


  /* Cursor movement থেকে নতুন smoke particle তৈরি করার জন্য */
  function addParticle(x, y, velocity) {
    if (particles.length >= 24) return;

    const element = document.createElement('span');
    element.className = 'cursor-smoke-particle';

    const size = 7 + Math.random() * 9;
    const life = 420 + Math.random() * 260;

    element.style.width = `${size}px`;
    element.style.height = `${size}px`;

    container.appendChild(element);

    particles.push({
      element,
      x: x - size / 2,
      y: y - size / 2,
      started: performance.now(),
      life,
      driftX:
        (Math.random() - 0.5) *
        (0.35 + velocity * 0.05),
      driftY: -0.1 - Math.random() * 0.35,
      rotation: (Math.random() - 0.5) * 20,
    });
  }


  /* Smoke particle-এর position, size এবং opacity animate করার জন্য */
  function animate(now) {
    particles.forEach((particle, index) => {
      const progress =
        (now - particle.started) / particle.life;

      if (progress >= 1) {
        particle.element.remove();
        particles.splice(index, 1);
        return;
      }

      particle.x += particle.driftX;
      particle.y += particle.driftY;

      const scale = 0.75 + progress * 1.1;
      const opacity = 0.24 * (1 - progress) ** 1.5;

      particle.element.style.opacity = opacity;

      particle.element.style.transform =
        `translate3d(${particle.x}px, ${particle.y}px, 0) ` +
        `scale(${scale}) ` +
        `rotate(${particle.rotation * progress}deg)`;
    });

    animationFrame =
      particles.length
        ? requestAnimationFrame(animate)
        : 0;
  }


  /* Mouse movement detect করে cursor trail তৈরি করার জন্য */
  window.addEventListener(
    'pointermove',
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;

      /* প্রথমবার cursor পাওয়া গেলে ring-এর position সেট করার জন্য */
      if (!hasPointer) {
        ringX = targetX;
        ringY = targetY;
        cursorRing.classList.add('is-visible');
      }

      const distance = hasPointer
        ? Math.hypot(
            event.clientX - lastX,
            event.clientY - lastY
          )
        : 0;

      if (!hasPointer) {
        hasPointer = true;
        lastX = event.clientX;
        lastY = event.clientY;
        return;
      }

      /* Cursor খুব কম নড়লে unnecessary particle তৈরি না করার জন্য */
      if (distance < 5) return;

      lastX = event.clientX;
      lastY = event.clientY;

      addParticle(
        event.clientX,
        event.clientY,
        Math.min(distance, 40)
      );

      /* Particle থাকলে animation চালু করার জন্য */
      if (!animationFrame) {
        animationFrame = requestAnimationFrame(animate);
      }
    },
    { passive: true }
  );
})();


// ৪. Projects Section — Dynamic Cards + Pagination

(function () {
  /* সব project-এর তথ্য এখানে রাখা হয়েছে */
  const PROJECTS = [
    {
      logo: 'https://shops-mehadee-hassan.vercel.app/assets/Logo-BPTDrPQZ.png',
      alt: 'Shops',
      title: 'Shops',
      description:
        'এটি একটি আধুনিক ফুল-স্ট্যাক ই-কমার্স প্ল্যাটফর্ম, যেখানে গ্রাহকরা সহজে প্রোডাক্ট ব্রাউজ, সার্চ ও অর্ডার করতে পারেন, আর অ্যাডমিনরা একটি সুরক্ষিত ড্যাশবোর্ড থেকে পুরো ইনভেন্টরি নিয়ন্ত্রণ করতে পারেন। ফ্রন্টএন্ড তৈরি হয়েছে React ও Redux Toolkit দিয়ে, যেখানে Tailwind CSS ব্যবহার করে একটি ক্লিন ও রেসপনসিভ ইউজার ইন্টারফেস ডিজাইন করা হয়েছে। ব্যাকএন্ড Node.js, Express ও Sequelize ORM দিয়ে তৈরি, MySQL ডাটাবেসের সাথে সংযুক্ত এবং JWT-ভিত্তিক অথেন্টিকেশন সিস্টেম ব্যবহার করে অ্যাডমিন ও ইউজার অ্যাক্সেস নিয়ন্ত্রণ করা হয়। প্রোডাক্ট ইমেজ আপলোড ও ম্যানেজমেন্টের জন্য Cloudinary ব্যবহার করা হয়েছে, এবং প্রজেক্টটি Render ও Vercel-এ ডিপ্লয় করে ক্লাউড-হোস্টেড MySQL ডাটাবেসের (Aiven) সাথে যুক্ত করা হয়েছে।',
      link: 'https://shops-mehadee-hassan.vercel.app',
    },

    {
      logo: '/images/favicon.svg',
      alt: 'Dev Stack logo',
      title: 'Dev Stack',
      description:
        'এটি একটি আধুনিক এবং ইন্টারঅ্যাক্টিভ ডেভেলপার টেকনোলজি এক্সপ্লোরিং প্ল্যাটফর্ম, যেখানে ডেভেলপাররা Frontend, Backend, Database, Programming Language, Styling এবং DevOps-এর বিভিন্ন টেকনোলজি সম্পর্কে জানতে এবং নিজেদের পছন্দের টেকনোলজি দিয়ে একটি Personal Development Stack তৈরি করতে পারেন। প্রতিটি টেকনোলজির Rating ও Difficulty Level দেখার পাশাপাশি পছন্দের টেকনোলজি সহজেই Stack-এ যুক্ত এবং ম্যানেজ করা যায়। প্রজেক্টটি React.js দিয়ে তৈরি করা হয়েছে এবং Local JSON Dataset ব্যবহার করে ডায়নামিকভাবে টেকনোলজি ডেটা প্রদর্শন করা হয়েছে। Responsive Design, Reusable Components এবং Interactive UI-এর মাধ্যমে ডেভেলপারদের জন্য একটি সহজ, দ্রুত ও সুন্দর user experience নিশ্চিত করা হয়েছে।',
      link: 'https://dev-stack-eta.vercel.app/',
    },

    {
      logo: 'https://hero-io-gamma.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fimmutable%2Fmedia%2Flogo.1wrs3ds2-8_su.png&w=48&q=75',
      alt: 'HERO.IO logo',
      title: 'HERO.IO',
      description:
        'এটি একটি আধুনিক ও responsive App Explorer platform, যেখানে ব্যবহারকারীরা বিভিন্ন application browse, search ও category অনুযায়ী filter করতে পারেন এবং প্রতিটি app-এর বিস্তারিত তথ্য দেখতে পারেন। App details page-এ application logo, developer information, description, rating, reviews, downloads ও size-এর মতো গুরুত্বপূর্ণ তথ্য প্রদর্শন করা হয়। ব্যবহারকারীরা পছন্দের application install করে নিজেদের personal app collection তৈরি করতে পারেন এবং Installed Apps section থেকে installed applications manage বা uninstall করতে পারেন। Installed apps size অনুযায়ী ascending ও descending order-এ sort করার সুবিধাও রয়েছে। প্রজেক্টটি Next.js ও React-এর মাধ্যমে TypeScript ব্যবহার করে তৈরি করা হয়েছে এবং Tailwind CSS দিয়ে responsive ও modern UI তৈরি করা হয়েছে। React Context API ও React Hooks ব্যবহার করে application installation state management করা হয়েছে এবং React Toastify ব্যবহার করে installation ও uninstall-এর মতো user actions-এর জন্য instant notifications দেওয়া হয়েছে।',
      link: 'https://hero-io-gamma.vercel.app',
    },

    {
      logo: 'https://book-vibe-beryl-six.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fimmutable%2Fmedia%2Ffavicon.0_5n8vrnywfp4.png&w=48&q=75',
      alt: 'Book Vibe logo',
      title: 'Book Vibe',
      description:
        'এটি একটি আধুনিক ও ইন্টারঅ্যাক্টিভ বই ম্যানেজমেন্ট এবং রিডিং ট্র্যাকিং প্ল্যাটফর্ম, যেখানে ব্যবহারকারীরা বিভিন্ন বই ব্রাউজ করতে, বিস্তারিত তথ্য দেখতে এবং নিজেদের reading journey ম্যানেজ করতে পারেন। প্রতিটি বইয়ের author, rating, review, category, tags, total pages, publisher এবং publication year-এর মতো বিস্তারিত তথ্য দেখার সুবিধা রয়েছে। ব্যবহারকারীরা বইকে Read List অথবা Wishlist-এ যুক্ত করতে পারেন এবং নিজের লাইব্রেরিতে থাকা বইগুলো rating, pages ও publishing year অনুযায়ী sort করতে পারেন। প্রজেক্টটি Next.js ও React-এর মাধ্যমে TypeScript ব্যবহার করে তৈরি করা হয়েছে এবং Tailwind CSS দিয়ে responsive ও modern UI তৈরি করা হয়েছে। React Context API ব্যবহার করে reading list ও wishlist-এর client-side state management করা হয়েছে এবং React Toastify ও Recharts-এর মাধ্যমে interactive feedback ও data visualization-এর সুবিধা যুক্ত করা হয়েছে।',
      link: 'https://book-vibe-beryl-six.vercel.app',
    },

    {
      logo: '/images/movie.png',
      alt: 'MarqueeReel logo',
      title: 'MarqueeReel',
      description:
        'এটি একটি আধুনিক ও responsive Movie & TV Show Explorer platform, যেখানে ব্যবহারকারীরা বিভিন্ন TV show browse, search এবং বিস্তারিত তথ্য দেখতে পারেন। TVMaze API ব্যবহার করে real-time show data fetch করা হয়েছে এবং title অনুযায়ী live search-এর সুবিধা যুক্ত করা হয়েছে। প্রতিটি show-এর poster, rating, premiere year এবং অন্যান্য গুরুত্বপূর্ণ তথ্য card আকারে প্রদর্শন করা হয়েছে। Details modal-এর মাধ্যমে show-এর summary, genre, network, status ও runtime-এর মতো বিস্তারিত তথ্য দেখা যায়। প্রজেক্টটি React.js ও React Router দিয়ে তৈরি করা হয়েছে এবং Tailwind CSS ব্যবহার করে একটি modern, responsive ও cinema-inspired UI তৈরি করা হয়েছে। Reusable components, React Hooks, API integration, loading ও error state handling এবং keyboard-friendly modal interaction ব্যবহার করে একটি smooth user experience নিশ্চিত করা হয়েছে।',
      link: 'https://marqueereel.vercel.app',
    },

    {
      logo: 'https://bpl-dream11-two.vercel.app/assets/Group%201-DE68HT7x.png',
      alt: 'BPL CricBid logo',
      title: 'BPL CricBid',
      description:
        'এটি একটি আধুনিক এবং ইন্টারঅ্যাক্টিভ BPL Player Auction Management Web Application, যেখানে ব্যবহারকারীরা বিভিন্ন ক্রিকেটার সম্পর্কে বিস্তারিত তথ্য দেখতে এবং পছন্দের খেলোয়াড়দের একটি নির্দিষ্ট বাজেটের মধ্যে তাদের স্কোয়াডে যুক্ত করতে পারেন। প্রজেক্টটিতে Available Players ও Selected Players আলাদাভাবে ম্যানেজ করার সুবিধা রয়েছে এবং প্রতিটি খেলোয়াড়ের মূল্য ও নির্বাচনের তথ্য ডায়নামিকভাবে পরিচালনা করা হয়েছে। React.js এবং TypeScript ব্যবহার করে অ্যাপ্লিকেশনটি তৈরি করা হয়েছে, যেখানে Tailwind CSS দিয়ে রেসপনসিভ ও আধুনিক UI ডিজাইন করা হয়েছে। Player Selection, Budget Management, Toast Notification এবং Interactive Components-এর মাধ্যমে একটি বাস্তবসম্মত ক্রিকেট Player Auction-এর অভিজ্ঞতা দেওয়ার চেষ্টা করা হয়েছে।',
      link: 'https://bpl-dream11-two.vercel.app/',
    },

    {
      logo: '/images/download.svg',
      alt: 'Coding Mind logo',
      title: 'Coding Mind',
      description:
        'এটি একটি আধুনিক এবং ফ্রি মক এপিআই (Mock API) ম্যানেজমেন্ট প্ল্যাটফর্ম। ফ্রন্টএন্ড এবং ব্যাকএন্ড ডেভেলপারদের কাজের গতি বাড়াতে এটি তৈরি করা হয়েছে। এর মাধ্যমে কোনো ব্যাকএন্ড কোড ছাড়াই আনলিমিটেড প্রজেক্ট ও এন্ডপয়েন্ট তৈরি করা, ডায়নামিক রেসপন্স কনফিগার করা, ফেক ডেটা জেনারেট করা এবং এরর/ডিলে সিমুলেট করার মতো দারুণ সব ফিচার ব্যবহার করা যায়। পুরো ল্যান্ডিং পেজটি Tailwind CSS দিয়ে চমৎকারভাবে ডিজাইন করা হয়েছে।',
      link: 'https://coding-mind-mehadee-hassan.vercel.app/',
    },

    {
      logo: '/images/favicon-Bx60cIKr.png',
      alt: 'Code Fight logo',
      title: 'Code Fight',
      description:
        'এটি একটি আধুনিক ব্লগিং প্ল্যাটফর্ম যেখানে ব্যবহারকারীরা বিভিন্ন বিষয়ে ব্লগ পড়তে পারেন। এটি একটি ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন যা রেসপনসিভ ডিজাইনের মাধ্যমে তৈরি করা হয়েছে।',
      link: 'https://blog-project-eight-pi.vercel.app/',
    },

    {
      logo: 'https://nature-s-platter-three.vercel.app/img/Vector.png',
      alt: "Nature's Platter",
      title: "Nature's Platter",
      description:
        'এটি একটি ফ্রেশ ও অর্গানিক ফুড ল্যান্ডিং ও অর্ডার প্লেটফর্ম, যেখানে ব্যবহারকারীরা সহজে বিভিন্ন ফুড আইটেম ব্রাউজ করতে পারেন। এতে ফুড ক্যাটাগরি, আকর্ষণীয় হিরো ব্যানার ও প্রমোশনাল সেকশন রয়েছে। সম্পূর্ণ প্রজেক্টটি HTML, CSS এবং JavaScript দিয়ে রেসপনসিভ ও ক্লিন ইউআই ডিজাইনে তৈরি করা হয়েছে।',
      link: 'https://nature-s-platter-three.vercel.app/',
    },

    {
      logo: 'https://bpl-dream11-two.vercel.app/assets/Group%201-DE68HT7x.png',
      alt: 'BPL Dream11',
      title: 'BPL Dream11',
      description:
        'এটি একটি ইন্টারেক্টিভ ও ডায়নামিক ফ্যান্টাসি ক্রিকেট ওয়েব অ্যাপ্লিকেশন, যেখানে ইউজাররা তাদের পছন্দের বিপিএল খেলোয়াড়দের নিয়ে নিজস্ব একাদশ (Dream Team) গঠন করতে পারেন। অ্যাপ্লিকেশনে নির্দিষ্ট ভার্চুয়াল বাজেট সিস্টেম রয়েছে, যার মাধ্যমে প্লেয়ার সিলেক্ট ও রিমুভ করার সুযোগ রয়েছে। ফ্রন্টএন্ড তৈরিতে React, TypeScript এবং Tailwind CSS ব্যবহার করা হয়েছে, যা ওয়েবসাইটটিকে অত্যন্ত ফাস্ট ও রেসপনসিভ করেছে।',
      link: 'https://bpl-dream11-two.vercel.app/',
    },

    {
      logo: 'https://learn-with-mehedi.vercel.app/favicon.ico',
      alt: 'Learn with Mehedi logo',
      title: 'Learn with Mehedi',
      description:
        'এটি একটি ইন্টারঅ্যাক্টিভ ই-লার্নিং বা এডুকেশনাল প্ল্যাটফর্ম, যেখানে শিক্ষার্থীরা বিভিন্ন কোর্স এবং টিউটোরিয়াল অ্যাক্সেস করতে পারে। প্ল্যাটফর্মটি ব্যবহারকারী-বান্ধব ইন্টারফেস এবং ক্লিন নেভিগেশনের ওপর ভিত্তি করে তৈরি করা হয়েছে, যাতে শেখার অভিজ্ঞতা সহজ ও আনন্দদায়ক হয়। এটি মূলত আধুনিক ওয়েব টেকনোলজি ব্যবহার করে একটি দক্ষ লার্নিং ইকোসিস্টেম হিসেবে ডিজাইন করা।',
      link: 'https://learn-with-mehedi.vercel.app/',
    },

    {
      logo: '/images/online-shop Background Removed copy.png',
      alt: 'ReactMart logo',
      title: 'ReactMart',
      description:
        'React.js দিয়ে তৈরি একটি আধুনিক এবং রেসপনসিভ ই-কমার্স ওয়েব অ্যাপ্লিকেশন। এই প্রজেক্টে প্রোডাক্ট লিস্টিং, ডায়নামিক প্রোডাক্ট ফিল্টারিং, কার্ট (Cart) ম্যানেজমেন্ট এবং একটি স্মুথ ইউজার ইন্টারফেস অন্তর্ভুক্ত রয়েছে। সিঙ্গেল পেজ অ্যাপ্লিকেশন (SPA) হিসেবে ব্যবহারকারীদের চমৎকার ও দ্রুত শপিং অভিজ্ঞতা দেওয়ার জন্য এটি ডিজাইন করা হয়েছে।',
      link: 'https://ecommace-react-js.vercel.app/',
    },

    {
      logo: 'https://bootstrap-ecommerce-silk.vercel.app/images/grocery%20logo%20Background%20Removed.png',
      alt: 'metualogo',
      title: 'Metua Grocery',
      description:
        'বর্তমান সময়ে অনলাইন শপিং আমাদের দৈনন্দিন জীবনের একটি অপরিহার্য অংশে পরিণত হয়েছে। সেই প্রয়োজনের প্রতি সাড়া দিয়ে Metua Grocery একটি আধুনিক এবং ব্যবহারবান্ধব প্ল্যাটফর্ম হিসেবে আত্মপ্রকাশ করেছে। এটি শুধু একটি সাধারণ অনলাইন মুদি দোকান নয়, বরং একটি এমন জায়গা যেখানে গ্রাহকরা সহজে এবং দ্রুত তাদের প্রয়োজনীয় পণ্যসমূহ অর্ডার করতে পারেন।',
      link: 'https://bootstrap-ecommerce-silk.vercel.app/',
    },

    // নতুন project যোগ করতে হলে এখানে object যোগ করুন
  ];


  /* প্রতি page-এ কয়টি project দেখাবে */
  const PAGE_SIZE = 6;

  const grid = document.getElementById('projectsGrid');
  const paginationList =
    document.getElementById('projectsPagination');

  if (!grid || !paginationList) return;


  /* মোট কতগুলো pagination page প্রয়োজন তা হিসাব করার জন্য */
  const totalPages = Math.max(
    1,
    Math.ceil(PROJECTS.length / PAGE_SIZE)
  );

  let currentPage = 1;


  /* Project data থেকে একটি dynamic card তৈরি করার জন্য */
  function createCard(project) {
    const col = document.createElement('div');

    col.className =
      'col-12 col-md-6 col-lg-4 d-flex justify-content-center';

    col.innerHTML =
      '<div class="card custom-card text-start">' +
      '<div class="logo-area text-center">' +
      '<img src="' +
      project.logo +
      '" alt="' +
      project.alt +
      '" class="brand-logo" />' +
      '</div>' +
      '<h5 class="fw-bold mb-3">' +
      project.title +
      '</h5>' +
      '<p class="text-muted mb-4">' +
      project.description +
      '</p>' +
      '<div class="button-area">' +
      '<a href="' +
      project.link +
      '" target="_blank" rel="noopener noreferrer" class="btn-visit">ভিজিট করুন</a>' +
      '</div>' +
      '</div>';

    return col;
  }


  /* Current page অনুযায়ী visible pagination numbers তৈরি করার জন্য */
  function getVisiblePages(total, current) {
    const delta = 1;
    const pages = [];

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      }
    }

    const withDots = [];
    let prev = 0;

    pages.forEach((page) => {
      if (prev && page - prev === 2) {
        withDots.push(prev + 1);
      } else if (prev && page - prev > 2) {
        withDots.push('...');
      }

      withDots.push(page);
      prev = page;
    });

    return withDots;
  }


  /* Pagination-এর একটি page button তৈরি করার জন্য */
  function addPageItem(
    label,
    page,
    { active = false, disabled = false } = {}
  ) {
    const li = document.createElement('li');

    li.className =
      'proj-page-item' +
      (active ? ' active' : '') +
      (disabled ? ' disabled' : '');

    const btn = document.createElement('button');

    btn.type = 'button';
    btn.className = 'proj-page-btn';
    btn.textContent = label;
    btn.disabled = disabled;

    if (active) {
      btn.setAttribute('aria-current', 'page');
    }

    /* Active বা disabled না হলে page change করার জন্য */
    if (!disabled && !active) {
      btn.addEventListener('click', () =>
        renderPage(page, true)
      );
    }

    li.appendChild(btn);
    paginationList.appendChild(li);
  }


  /* Previous, Next এবং page number দিয়ে pagination render করার জন্য */
  function renderPagination() {
    paginationList.innerHTML = '';

    if (totalPages <= 1) return;

    /* Previous button */
    addPageItem('«', currentPage - 1, {
      disabled: currentPage === 1,
    });

    /* Page numbers */
    getVisiblePages(totalPages, currentPage).forEach((page) => {
      if (page === '...') {
        addPageItem('...', null, {
          disabled: true,
        });
      } else {
        addPageItem(String(page), page, {
          active: page === currentPage,
        });
      }
    });

    /* Next button */
    addPageItem('»', currentPage + 1, {
      disabled: currentPage === totalPages,
    });
  }


  /* Selected page-এর project cards এবং pagination render করার জন্য */
  function renderPage(page, isUserTriggered) {
    /* Valid page number-এর মধ্যে current page রাখার জন্য */
    currentPage = Math.min(
      Math.max(page, 1),
      totalPages
    );

    /* আগের cards remove করার জন্য */
    grid.innerHTML = '';

    /* Current page-এর প্রথম project-এর index বের করার জন্য */
    const start =
      (currentPage - 1) * PAGE_SIZE;

    /* Current page-এর projects dynamically render করার জন্য */
    PROJECTS
      .slice(start, start + PAGE_SIZE)
      .forEach((project) => {
        grid.appendChild(createCard(project));
      });

    /* নতুন cards-এর See More functionality initialize করার জন্য */
    initExpandableDescriptions(grid);

    /* Pagination update করার জন্য */
    renderPagination();


    /* User pagination click করলে projects section-এ smooth scroll করার জন্য */
    if (isUserTriggered) {
      const section =
        grid.closest('.main-container');

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }


  /* Page load হলে প্রথম ৬টি project দেখানোর জন্য */
  renderPage(1, false);
})();