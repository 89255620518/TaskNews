import styles from './registerModal.module.scss';
import { FaCheckCircle } from 'react-icons/fa';

const RegisterModal = () => {

    return (
        <div className={styles.successModal}>
            <div className={styles.successContent}>
                <FaCheckCircle className={styles.successIcon} />
                <h2 className={styles.successTitle}>Регистрация прошла успешно!</h2>
            </div>
        </div>
    )
}

export default RegisterModal;