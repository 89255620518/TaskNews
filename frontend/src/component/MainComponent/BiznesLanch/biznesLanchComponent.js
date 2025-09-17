import styles from './biznesLanch.module.scss';
import MenuCard from '../../MenuComponent/menuCard'
import biznesFon from '../Banner/img/biznes.jpg';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../../api/api';

const BiznesLanchComponent = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(3);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const carouselRef = useRef(null);
    const animationRef = useRef(null);

    const fetchMenuItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.goods.getAll();
            // Фильтруем только товары с категорией "Новинки"
            const novelties = response?.results?.filter(item => item.type === 'Бизнес ланч') || [];
            setMenuItems(novelties);
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

    // Навигация карусели
    const nextSlide = useCallback(() => {
        if (currentIndex >= menuItems.length - cardsPerView) return;
        cancelAnimationFrame(animationRef.current);
        setCurrentIndex(prev => prev + 1);
    }, [currentIndex, menuItems.length, cardsPerView]);

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
        currentIndex < menuItems.length - cardsPerView,
        currentIndex > 0
    ], [currentIndex, menuItems.length, cardsPerView]);

    if (loading) return <div className={styles.loading}>Загрузка Бизнес-Ланч...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!menuItems.length) return <EmptyMenu />;

    return (
        <div className={styles.containerBiznes}>
            <div className={styles.containerBiznes__content}>
                <div className={styles.containerBiznes__content__info}>
                    <img
                        className={styles.containerBiznes__content__info_img}
                        src={biznesFon}
                        alt='Бизнес-Ланч Дали-Хинкали'
                    />

                    <p className={styles.containerBiznes__content__info_text}>Ежедневно<span className={styles.containerBiznes__content__info_text_span}>с 11:30 до 16:00</span></p>
                </div>

                <div className={styles.containerBiznes__content__menu}>
                    <h1 className={styles.containerBiznes__content__menu__h1}>Бизнес-Ланч</h1>

                    <div className={styles.carouselContainer}>
                        {menuItems.length > cardsPerView && canGoPrev && (
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
                                {menuItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={styles.carouselItem}
                                        style={{
                                            flex: `0 0 ${100 / cardsPerView}%`,
                                        }}
                                    >
                                        <MenuCard item={item} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {menuItems.length > cardsPerView && canGoNext && (
                            <button
                                className={`${styles.carouselButton} ${styles.carouselButtonNext}`}
                                onClick={nextSlide}
                                aria-label="Следующий слайд"
                            >
                                <FaChevronRight />
                            </button>
                        )}
                    </div>

                    {menuItems.length > cardsPerView && (
                        <div className={styles.pagination}>
                            {Array.from({ length: Math.ceil(menuItems.length / cardsPerView) }).map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.paginationDot} ${index === Math.floor(currentIndex / cardsPerView) ? styles.active : ''}`}
                                    onClick={() => setCurrentIndex(index * cardsPerView)}
                                    aria-label={`Перейти к слайду ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const EmptyMenu = () => (
    <div className={styles.emptyContainer}>
        <h2 className={styles.emptyTitle}>Меню пока пустое</h2>
        <p className={styles.emptyMessage}>Скоро появятся новые товары. Следите за обновлениями!</p>
        <button
            className={styles.emptyButton}
            onClick={() => window.location.reload()}
        >
            Обновить страницу
        </button>
    </div>
);

export default BiznesLanchComponent;