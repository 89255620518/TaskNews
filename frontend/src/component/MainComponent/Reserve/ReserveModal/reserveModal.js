import styles from './reserveModal.module.scss';
import { FaCheckCircle } from 'react-icons/fa';

const ReserveModal = () => {

    return (
        <div className={styles.successModal}>
            <div className={styles.successContent}>
                <FaCheckCircle className={styles.successIcon} />
                <h2 className={styles.successTitle}>БРОНИРОВАНИЕ ПРОШЛО УСПЕШНО</h2>
                <p className={styles.successText}>Администратор свяжется с вами для подтверждения</p>
            </div>
        </div>
    )
}

export default ReserveModal;