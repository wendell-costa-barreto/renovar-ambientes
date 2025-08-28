import React, { useState, useEffect, useRef, useCallback } from "react";
import "./home.css";
import NavBar from "../components/navbar";
const RenovarAmbientes = () => {
  const [currentIndexDif, setCurrentIndexDif] = useState(0);

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(1);
  const [slideWidth, setSlideWidth] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const trackRef = useRef(null);
  const carrosselDifRef = useRef(null);
  const carouselContainerRef = useRef(null);

  const gap = 12; // Gap between slides in pixels

  // Slides data
  const originalSlides = [
    "imagens/imagem-01.png",
    "imagens/imagem-02.png",
    "imagens/imagem-03.PNG",
    "imagens/imagem-04.PNG",
    "imagens/imagem-05.PNG",
    "imagens/imagem08 (Personalizado).PNG",
  ];

  // Create cloned slides for infinite effect
  const slidesGal = [
    ...originalSlides.map((slide, index) => ({
      src: slide,
      id: `clone-start-${index}`,
      isClone: true,
    })),
    ...originalSlides.map((slide, index) => ({
      src: slide,
      id: `original-${index}`,
      isClone: false,
    })),
    ...originalSlides.map((slide, index) => ({
      src: slide,
      id: `clone-end-${index}`,
      isClone: true,
    })),
  ];

  const diferenciais = [
    {
      title: "Acabamento Premium",
      content:
        "Exclusividade em cada detalhe. Utilizamos técnicas refinadas de pintura e aplicação de acabamentos, como laca alto brilho, texturas exclusivas e bordas imperceptíveis. O resultado são superfícies impecáveis, com toque e aparência de luxo.",
    },
    {
      title: "Design Sob Medida e Assinatura",
      content:
        "Projetos com identidade. Cada ambiente é pensado em parceria com o cliente, integrando funcionalidade e estética de forma única. Nosso design autoral valoriza a arquitetura e eleva a experiência de morar com estilo.",
    },
    {
      title: "Ferragens de Alta Performance",
      content:
        "Tecnologia e conforto no uso diário. Utilizamos ferragens alemãs ou italianas com sistemas de amortecimento, abertura assistida, push-open e organizadores internos. Funcionamento suave, silencioso e duradouro.",
    },
    {
      title: "Iluminação Embutida e Inteligente",
      content:
        "Ambientes com atmosfera. Projetos com iluminação LED embutida em nichos, armários e prateleiras, criando efeitos sofisticados e funcionais. Opções com sensores e integração à automação residencial.",
    },
    {
      title: "Marcenaria Sustentável",
      content:
        "Elegância com responsabilidade. Usamos apenas painéis com certificação FSC e fornecedores comprometidos com práticas ecológicas. Nossos resíduos são destinados corretamente, priorizando o respeito ao meio ambiente.",
    },
  ];

  // Calculate how many slides to show based on window width
  const getSlidesToShow = useCallback(() => {
    return window.innerWidth >= 769 ? 3 : 1;
  }, []);

  // Apply sizes to slides
  const applySizes = useCallback(() => {
    if (!carouselContainerRef.current || !trackRef.current) return;

    const newSlidesToShow = getSlidesToShow();
    setSlidesToShow(newSlidesToShow);

    const viewportWidth = carouselContainerRef.current.clientWidth;
    const totalGap = gap * (newSlidesToShow - 1);
    const newSlideWidth = (viewportWidth - totalGap) / newSlidesToShow;
    setSlideWidth(newSlideWidth);

    // Apply width to all slides
    const allSlideElements = trackRef.current.children;
    Array.from(allSlideElements).forEach((img) => {
      img.style.flex = `0 0 ${newSlideWidth}px`;
      img.style.maxWidth = `${newSlideWidth}px`;
    });

    // Set initial position only once when component is first initialized
    if (!isInitialized) {
      const initialIndex = originalSlides.length;
      setCurrentIndex(initialIndex);
      goToSlideImmediate(initialIndex);
      setIsInitialized(true);
    }
  }, [getSlidesToShow, originalSlides.length, isInitialized]);

  // Go to specific slide immediately (no animation)
  const goToSlideImmediate = useCallback(
    (index) => {
      if (!trackRef.current || slideWidth === 0) return;

      const offset = (slideWidth + gap) * index;
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${offset}px)`;
    },
    [slideWidth, gap]
  );

  // Go to specific slide with animation
  const goToSlide = useCallback(
    (index, animate = true) => {
      if (!trackRef.current || slideWidth === 0) return;

      setCurrentIndex(index);
      const offset = (slideWidth + gap) * index;

      trackRef.current.style.transition = animate
        ? "transform 0.5s ease-in-out"
        : "none";
      trackRef.current.style.transform = `translateX(-${offset}px)`;
    },
    [slideWidth, gap]
  );

  // Handle transition end for infinite effect
  const handleTransitionEnd = useCallback(() => {
    if (!isInitialized) return;

    const totalSlides = slidesGal.length;
    const originalLength = originalSlides.length;

    // If we're at the end clones, jump to the original slides
    if (currentIndex >= totalSlides - originalLength) {
      const newIndex =
        originalLength + (currentIndex - (totalSlides - originalLength));
      setCurrentIndex(newIndex);
      goToSlideImmediate(newIndex);
    }

    // If we're at the beginning clones, jump to the end of original slides
    if (currentIndex < originalLength) {
      const newIndex = totalSlides - originalLength + currentIndex;
      setCurrentIndex(newIndex);
      goToSlideImmediate(newIndex);
    }
  }, [
    currentIndex,
    slidesGal.length,
    originalSlides.length,
    goToSlideImmediate,
    isInitialized,
  ]);

  // Next and previous slide functions
  const nextSlide = useCallback(() => {
    if (!isInitialized) return;
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide, isInitialized]);

  const prevSlide = useCallback(() => {
    if (!isInitialized) return;
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide, isInitialized]);

  // Drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [movedX, setMovedX] = useState(0);

  const startDrag = useCallback(
    (e) => {
      if (!isInitialized) return;

      setIsDragging(true);
      const clientX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
      setStartX(clientX);
      setMovedX(0);

      if (trackRef.current) {
        trackRef.current.style.transition = "none";
      }
    },
    [isInitialized]
  );

  const moveDrag = useCallback(
    (e) => {
      if (!isDragging || !isInitialized) return;

      const clientX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
      const newMovedX = clientX - startX;
      setMovedX(newMovedX);

      if (trackRef.current) {
        const offset = (slideWidth + gap) * currentIndex - newMovedX;
        trackRef.current.style.transform = `translateX(-${offset}px)`;
      }
    },
    [isDragging, startX, slideWidth, gap, currentIndex, isInitialized]
  );

  const endDrag = useCallback(() => {
    if (!isDragging || !isInitialized) return;
    setIsDragging(false);

    if (Math.abs(movedX) > 50) {
      if (movedX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      goToSlide(currentIndex);
    }
  }, [
    isDragging,
    movedX,
    prevSlide,
    nextSlide,
    currentIndex,
    goToSlide,
    isInitialized,
  ]);

  // Diferenciais carousel
  useEffect(() => {
    if (carrosselDifRef.current) {
      const translateValue = -currentIndexDif * 100 + "%";
      carrosselDifRef.current.style.transform =
        "translateX(" + translateValue + ")";
    }
  }, [currentIndexDif]);

  const nextDif = () => {
    setCurrentIndexDif((prev) => (prev + 1) % diferenciais.length);
  };

  const prevDif = () => {
    setCurrentIndexDif(
      (prev) => (prev - 1 + diferenciais.length) % diferenciais.length
    );
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Formulário enviado com sucesso! Entraremos em contato em breve.");
    e.target.reset();
  };

  // Initialize carousel
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      applySizes();
    }, 100);

    // Set up resize listener
    const handleResize = () => {
      if (isInitialized) {
        applySizes();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [applySizes, isInitialized]);

  // Set up event listeners after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const trackElement = trackRef.current;
    if (!trackElement) return;

    // Set up transition end listener
    trackElement.addEventListener("transitionend", handleTransitionEnd);

    // Set up drag events
    trackElement.addEventListener("mousedown", startDrag);
    trackElement.addEventListener("mousemove", moveDrag);
    trackElement.addEventListener("mouseup", endDrag);
    trackElement.addEventListener("mouseleave", endDrag);
    trackElement.addEventListener("touchstart", startDrag, { passive: true });
    trackElement.addEventListener("touchmove", moveDrag, { passive: true });
    trackElement.addEventListener("touchend", endDrag);

    // Set up autoplay
    const intervalTime = 4000;
    const slideInterval = setInterval(nextSlide, intervalTime);

    // Cleanup
    return () => {
      if (trackElement) {
        trackElement.removeEventListener("transitionend", handleTransitionEnd);
        trackElement.removeEventListener("mousedown", startDrag);
        trackElement.removeEventListener("mousemove", moveDrag);
        trackElement.removeEventListener("mouseup", endDrag);
        trackElement.removeEventListener("mouseleave", endDrag);
        trackElement.removeEventListener("touchstart", startDrag);
        trackElement.removeEventListener("touchmove", moveDrag);
        trackElement.removeEventListener("touchend", endDrag);
      }
      clearInterval(slideInterval);
    };
  }, [
    isInitialized,
    handleTransitionEnd,
    startDrag,
    moveDrag,
    endDrag,
    nextSlide,
  ]);

  // Calculate active dot index for navigation
  const activeDotIndex = isInitialized
    ? Math.max(
        0,
        Math.min(
          Math.floor((currentIndex - originalSlides.length) / slidesToShow),
          Math.ceil(originalSlides.length / slidesToShow) - 1
        )
      )
    : 0;

  return (
    <div className="App">
      <NavBar />
      <main>
        <div className="capa">
          <h1 className="title-capa">
            Cada projeto carrega uma história. <br /> A sua.
          </h1>
        </div>

        <section className="sobre" id="sobre">
          <div className="title-sobre">
            <h2>Nossa história</h2>
          </div>
          <div className="text-sobre">
            <p>
              Na nossa marcenaria, cada projeto é tratado como uma obra única.
              Trabalhamos com MDF, MDP, madeira natural, lâminas, Pintura Laca e
              fórmica de alta qualidade, criando móveis que unem sofisticação,
              exclusividade e personalidade. Acreditamos que um ambiente bem
              planejado vai além da estética: ele transmite estilo, acolhimento
              e valor. Por isso, desenvolvemos soluções sob medida que traduzem
              o desejo de cada cliente em móveis elegantes, funcionais e
              atemporais. Nosso compromisso é entregar muito mais do que móveis
              entregamos experiências únicas, com acabamentos impecáveis e
              design que inspira.
            </p>
          </div>
        </section>

        <section className="galeria">
          <h2>Galeria</h2>
          <div className="carousel-galeria" ref={carouselContainerRef}>
            <button className="carousel-button prev-gal" onClick={prevSlide}>
              &#10094;
            </button>
            <button className="carousel-button next-gal" onClick={nextSlide}>
              &#10095;
            </button>
            <div className="carousel-track-gal" ref={trackRef}>
              {slidesGal.map((slide) => (
                <img
                  key={slide.id}
                  src={slide.src}
                  alt="Gallery image"
                  className={slide.isClone ? "clone" : ""}
                />
              ))}
            </div>
            <div className="carousel-nav-gal">
              {Array.from({
                length: Math.ceil(originalSlides.length / slidesToShow),
              }).map((_, i) => (
                <button
                  key={i}
                  className={activeDotIndex === i ? "active" : ""}
                  onClick={() => {
                    if (isInitialized) {
                      const targetIndex =
                        i * slidesToShow + originalSlides.length;
                      goToSlide(targetIndex);
                    }
                  }}
                ></button>
              ))}
            </div>
          </div>
        </section>

        <section className="diferenciais">
          <h2>Diferenciais Renovar</h2>
          <div className="dif">
            <div className="carrossel-container" id="carrossel-container-dif">
              <div className="carrossel-dif" ref={carrosselDifRef}>
                {diferenciais.map((item, index) => (
                  <div key={index} className="itens-dif">
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                ))}
              </div>
              <button onClick={prevDif} className="button-carrossel">
                &#10094;
              </button>
              <button onClick={nextDif} className="button-carrossel">
                &#10095;
              </button>
            </div>
          </div>
        </section>

        <section className="contato" id="contato">
          <div className="contact-form">
            <h2>Peça um orçamento</h2>
            <form
              id="formContato"
              className="form-item"
              onSubmit={handleSubmit}
            >
              <label htmlFor="nome">Seu nome:</label>
              <input type="text" id="nome" required />
              <label htmlFor="numero">Número de telefone:</label>
              <input type="tel" id="numero" required />
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" required />
              <label htmlFor="endereco">Endereço:</label>
              <input type="text" id="endereco" required />
              <label htmlFor="servico">Descreva o serviço desejado:</label>
              <textarea name="servico" id="servico"></textarea>
              <div className="botao">
                <button type="submit">Enviar</button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h4>Siga nas redes</h4>
            <p>
              <a
                href="https://www.instagram.com/renovarambientesplanejados?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </p>
            <p>
              <a
                href="https://l.instagram.com/?u=https%3A%2F%2Fcontate.me%2Ffalecomrenovar%3Ffbclid%3DPAZXh0bgNhZW0CMTEAAaewLKc-SAqPYSwtpHCqsCN21FMWY0e2f2XgsnV1Td3tYd9s4WFSvw4I-IC0Ig_aem_cGRwMWpSWXbQi1EhyKMW-w&e=AT3wvojZS2NPnbPSnzao6R_HUou1YTZIBWpw2Yv7tcAlJxfnDCHcMQ_mn-w6YaEaFOJTTb6bu-eVe4dFpTuq5mYkemfUCoG4-yDuw-XvStbD_s8Z7bOscg"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 Renovar - Ambientes planejados. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default RenovarAmbientes;
