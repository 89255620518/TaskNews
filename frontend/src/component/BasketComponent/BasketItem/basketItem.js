import React from 'react';
import styles from './basketItem.module.scss';
import BasketButton from '../basketButton/basketButton';
import { useBasket } from '../../../useContext/basketContext';
import { FaTrashAlt } from 'react-icons/fa';

const BasketItem = React.memo(({ item = {} }) => {
    const { removeItem } = useBasket();
    const product = item?.goods || item;

    // Защита от undefined
    if (!product || !product.id) {
        console.error('Invalid item in BasketItem:', item);
        return null;
    }

    const handleRemove = async () => {
        try {
            if (product?.id) {
                await removeItem(product.id);
            }
        } catch (err) {
            console.error('Ошибка при удалении товара:', err);
        }
    };

    const firstImageObj = product.images?.[0];
    const imagePath = firstImageObj?.images;
    const BASE_URL = 'http://127.0.0.1:8000';
    const imageUrl = imagePath
        ? `${BASE_URL}${imagePath}`
        : '/placeholder.jpg';

    return (
        <div className={styles.containerBasketItem}>
            <div className={styles.itemImage}>
                <img
                    src={imageUrl}
                    alt={product.title || 'Товар'}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                    }}
                />
            </div>

            <div className={styles.itemInfo}>
                <h3 className={styles.itemTitle}>{product.title}</h3>
                <div className={styles.priceContainer}>
                    <span className={styles.unitPrice}>{item.price} ₽</span>
                    <span className={styles.multiply}>×</span>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <span className={styles.equals}>=</span>
                    <span className={styles.totalPrice}>{item.price} ₽</span>
                </div>
            </div>

            <div className={styles.itemActions}>
                <BasketButton
                    elem={product}
                    currentCount={item.quantity}
                    className={styles.quantityControl}
                />

                <button
                    onClick={handleRemove}
                    className={styles.removeButton}
                    title="Удалить товар"
                    disabled={!product?.id}
                >
                    <FaTrashAlt className={styles.trashIcon} />
                </button>
            </div>
        </div>
    );
});

export default BasketItem;