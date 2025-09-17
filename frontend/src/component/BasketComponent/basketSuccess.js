import styles from './basket.module.scss';
import { FaCheckCircle } from 'react-icons/fa';

const BasketSuccess = () => {

    return (
        <div className={styles.successModal}>
            <div className={styles.successContent}>
                <FaCheckCircle className={styles.successIcon} />
                <h2 className={styles.successTitle}>Заказ успешно оформлен!</h2>
                <p className={styles.successText}>Сейчас вы будете перенаправлены на страницу оплаты...</p>
            </div>
        </div>
    )
}

export default BasketSuccess;