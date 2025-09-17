import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import MenuCard from './menuCard';
import styles from './menu.module.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { api } from '../../api/api';
import { useLocation, useNavigate } from 'react-router-dom';

const MenuComponent = () => {
    const carouselRef = useRef(null);
    const animationRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const urlCategory = searchParams.get('category');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(3);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [activeCategory, setActiveCategory] = useState(urlCategory || 'Все');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (urlCategory) {
            setActiveCategory(urlCategory);
        }
    }, [urlCategory]);

    // Оптимизированная загрузка данных
    const fetchMenuItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.goods.getAll();
            setMenuItems(response?.results || []);
            setError(null);
        } catch (err) {
            console.error('Ошибка при загрузке меню:', err);
            setError('Не удалось загрузить меню. Пожалуйста, попробуйте позже.');
            setMenuItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);

    // Мемоизированные категории
    const categories = useMemo(() => {
        const allCategories = new Set(menuItems.map(item => item.type).filter(Boolean));
        return ['Все', ...Array.from(allCategories)];
    }, [menuItems]);

    // Оптимизированный фильтр товаров
    const filteredItems = useMemo(() => {
        return activeCategory === 'Все'
            ? menuItems
            : menuItems.filter(item => item.type === activeCategory);
    }, [activeCategory, menuItems]);

    // Адаптивный расчет количества карточек
    const updateCardsPerView = useCallback(() => {
        const width = window.innerWidth;
        setCardsPerView(width < 768 ? 1 : width < 1024 ? 2 : 3);
    }, []);

    useEffect(() => {
        updateCardsPerView();
        window.addEventListener('resize', updateCardsPerView);
        return () => window.removeEventListener('resize', updateCardsPerView);
    }, [updateCardsPerView]);

    // Сброс индекса при смене категории
    useEffect(() => {
        setCurrentIndex(0);
    }, [activeCategory]);

    const handleCategoryChange = useCallback((category) => {
        setActiveCategory(category);
        // Обновляем URL при смене категории
        if (category === 'Все') {
            navigate('/menu');
        } else {
            navigate(`/menu?category=${encodeURIComponent(category)}`);
        }
        setCurrentIndex(0);
    }, [navigate]);

    // Навигация карусели
    const nextSlide = useCallback(() => {
        if (currentIndex >= filteredItems.length - cardsPerView) return;
        cancelAnimationFrame(animationRef.current);
        setCurrentIndex(prev => prev + 1);
    }, [currentIndex, filteredItems.length, cardsPerView]);

    const prevSlide = useCallback(() => {
        if (currentIndex <= 0) return;
        cancelAnimationFrame(animationRef.current);
        setCurrentIndex(prev => prev - 1);
    }, [currentIndex]);

    // Оптимизированные обработчики касаний
    const handleTouchStart = useCallback((e) => {
        if (window.innerWidth >= 768) return;
        const x = e.targetTouches[0].clientX;
        setTouchStart(x);
        setTouchEnd(x);
        setIsDragging(true);
        cancelAnimationFrame(animationRef.current);
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || window.innerWidth >= 768) return;
        setTouchEnd(e.targetTouches[0].clientX);
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        if (window.innerWidth >= 768 || !isDragging) return;
        setIsDragging(false);

        const swipeDistance = touchEnd - touchStart;
        const threshold = 50;

        if (swipeDistance < -threshold) {
            nextSlide();
        } else if (swipeDistance > threshold) {
            prevSlide();
        } else {
            animateReset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging, touchEnd, touchStart, nextSlide, prevSlide]);

    const animateReset = useCallback(() => {
        let start = null;
        const duration = 300;
        const startX = touchEnd - touchStart;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            const easePercentage = 1 - Math.pow(1 - percentage, 6);
            const currentX = startX * (1 - easePercentage);

            setTouchEnd(touchStart + currentX);

            if (progress < duration) {
                animationRef.current = requestAnimationFrame(step);
            } else {
                setTouchEnd(touchStart);
            }
        };

        animationRef.current = requestAnimationFrame(step);
    }, [touchEnd, touchStart]);

    const getOffset = useCallback(() => {
        return (window.innerWidth < 768 && isDragging) ? touchEnd - touchStart : 0;
    }, [isDragging, touchEnd, touchStart]);

    // Предварительный расчет состояний навигации
    const [canGoNext, canGoPrev] = useMemo(() => [
        currentIndex < filteredItems.length - cardsPerView,
        currentIndex > 0
    ], [currentIndex, filteredItems.length, cardsPerView]);

    if (loading) return <div className={styles.loading}>Загрузка меню...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!menuItems.length) return <EmptyMenu />;

    return (
        <div className={styles.containerSubMenu}>
            <div className={styles.categories}>
                {categories.map(category => (
                    <button
                        key={category}
                        className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
                <div className={styles.containerSubMenu__line}></div>
            </div>

            <h2 className={styles.containerSubMenu__h1}>{activeCategory}</h2>

            <div className={styles.carouselContainer}>
                {filteredItems.length > cardsPerView && canGoPrev && (
                    <button
                        className={`${styles.carouselButton} ${styles.carouselButtonPrev}`}
                        onClick={prevSlide}
                        aria-label="Предыдущий слайд"
                    >
                        <FaChevronLeft />
                    </button>
                )}

                <div
                    className={styles.carousel}
                    ref={carouselRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className={styles.carouselTrack}
                        style={{
                            transform: `translateX(calc(-${currentIndex * (100 / cardsPerView)}% + ${getOffset()}px)`,
                            transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={styles.carouselItem}
                                style={{
                                    flex: `0 0 ${100 / cardsPerView}%`,
                                    // padding: '0 60px',
                                }}
                            >
                                <MenuCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>

                {filteredItems.length > cardsPerView && canGoNext && (
                    <button
                        className={`${styles.carouselButton} ${styles.carouselButtonNext}`}
                        onClick={nextSlide}
                        aria-label="Следующий слайд"
                    >
                        <FaChevronRight />
                    </button>
                )}
            </div>
        </div>
    );
};

const EmptyMenu = () => (
    <div className={styles.emptyContainer}>
        <h2 className={styles.emptyTitle}>Меню пустое</h2>
        <p className={styles.emptyMessage}>Пока нет доступных товаров. Пожалуйста, проверьте позже.</p>
        <button
            className={styles.emptyButton}
            onClick={() => window.location.reload()}
        >
            Обновить страницу
        </button>
    </div>
);

export default MenuComponent;