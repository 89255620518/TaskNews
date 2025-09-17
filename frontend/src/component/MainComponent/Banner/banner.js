import styles from './banner.module.scss';
import mainMenu from './img/main.jpg';
import beverage from './img/bavarage.jpg';
import biznes from './img/biznes.jpg';
import service from './img/addServicesBanner.jpeg';
import { Link } from 'react-router-dom';
import { api } from '../../../api/api';
import { useCallback, useEffect, useState } from 'react';

const BannerComponent = () => {

    // Оптимизированная загрузка данных
    const fetchBeverageItems = useCallback(async () => {
        try {
            const response = await api.goods.getAll();
            const beverages = response?.results?.filter(item => item.type === 'Напитки') || [];
            return beverages;
        } catch (err) {
            console.error('Ошибка при загрузке напитков:', err);
            return [];
        }
    }, []);

    // Проверка наличия напитков
    const [hasBeverages, setHasBeverages] = useState(false);
    useEffect(() => {
        const checkBeverages = async () => {
            const beverages = await fetchBeverageItems();
            setHasBeverages(beverages.length > 0);
        };
        checkBeverages();
    }, [fetchBeverageItems]);

    // Обработчик клика для напитков
    const handleBeverageClick = (e) => {
        if (!hasBeverages) {
            e.preventDefault();
            alert('В данный момент напитки недоступны');
        }
        // Если напитки есть, переход произойдет через Link с параметром category=Напитки
    };

    return (
        <div className={styles.containerBanner}>
            <div className={styles.containerBanner__content}>
                <Link to='/menu' className={styles.menuItem}>
                    <div className={`${styles.menuImage} ${styles.mainMenu}`}>
                        <img src={mainMenu} alt="Основное меню Дали-Хинкали" loading="lazy" />
                    </div>
                    <p className={styles.menuText}>Основное меню</p>
                </Link>

                <Link
                    to='/menu?category=Напитки'
                    className={styles.menuItem}
                    onClick={handleBeverageClick}
                >
                    <div className={`${styles.menuImage} ${styles.beverage}`}>
                        <img src={beverage} alt="Напитки Дали-Хинкали" loading="lazy" />
                    </div>
                    <p className={styles.menuText}>Напитки</p>
                </Link>

                <Link to='/lanch' className={styles.menuItem}>
                    <div className={`${styles.menuImage} ${styles.business}`}>
                        <img src={biznes} alt="Бизнес ланч Дали-Хинкали" loading="lazy" />
                    </div>
                    <p className={styles.menuText}>Бизнес ланч</p>
                </Link>

                <Link to='/services' className={styles.menuItem}>
                    <div className={`${styles.menuImage} ${styles.service}`}>
                        <img src={service} alt="Дополнительные услуги Дали-Хинкали" loading="lazy" />
                    </div>
                    <p className={styles.menuText}>Доп услуги</p>
                </Link>
            </div>
        </div>
    );
};

export default BannerComponent;