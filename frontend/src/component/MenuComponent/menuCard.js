import { useState, useCallback } from 'react';
import styles from './menuCard.module.scss';
import { api } from '../../api/api';
import BasketButton from '../BasketComponent/basketButton/basketButton';
const MenuCard = ({ item }) => {
    const [showDescription, setShowDescription] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFavoriteToggle = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            if (item.is_favorited) {
                await api.goods.removeFavorite(item.id);
            } else {
                await api.goods.addFavorite(item.id);
            }
            // Здесь нужно обновить состояние is_favorited через родительский компонент или API
        } catch (err) {
            console.error('Ошибка:', err);
            setError('Произошла ошибка. Попробуйте снова.');
        } finally {
            setIsLoading(false);
        }
    }, [item.id, item.is_favorited, isLoading]);

    const imageUrl = item.images?.[0]?.images;

    return (
        <div className={styles.containerMenuCard}>
            <div className={styles.imageWrapper}>
                <img
                    className={styles.menuImage}
                    src={imageUrl}
                    alt={item.title}
                    onClick={() => setShowDescription(!showDescription)}
                    loading="lazy"
                />

                <button
                    className={`${styles.favoriteButton} ${item.is_favorited ? styles.active : ''}`}
                    onClick={handleFavoriteToggle}
                    disabled={isLoading}
                    aria-label={item.is_favorited ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                    ♥
                </button>
            </div>

            <div className={styles.menuContent}>
                <h3 className={styles.menuTitle}>{item.title}</h3>

                <div className={`${styles.descriptionContainer} ${showDescription ? styles.visible : ''}`}>
                    {showDescription && (
                        <>
                            <p className={styles.menuDescription}>
                                <strong className={styles.compound}>Описание:</strong> {item.description}
                            </p>
                            {item.compound && (
                                <div className={styles.compound}>
                                    <strong>Состав:</strong> {item.compound}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.menuDetails_weiCal}>
                    {item.weight > 0 && (
                        <span className={styles.menuWeight}>{item.weight} г</span>
                    )}
                    {item.calories > 0 && (
                        <span className={styles.menuWeight}>{item.calories} ккал</span>
                    )}
                </div>

                <div className={styles.menuFooter}>
                    <div className={styles.menuDetails}>
                        <span className={styles.menuPrice}>{item.price} ₽</span>
                    </div>

                    {/* Используем ваш компонент BasketButton */}
                    <BasketButton elem={item} />
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}
            </div>
        </div>
    );
};

export default MenuCard;