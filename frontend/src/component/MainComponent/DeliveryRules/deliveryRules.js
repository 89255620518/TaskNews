import styles from './deliveryRules.module.scss';
import cashFoto from './img/cash.svg';
import visaFoto from './img/visa.svg';
import deliveryFoto from './img/delivery.svg';

const rules = [
    {
        id: 1,
        src: cashFoto,
        title: "Наличными",
        description: "Оплата наличными при самовывозе из нашего городского Кафе"
    },

    {
        id: 2,
        src: visaFoto,
        title: "Банковской картой",
        description: "Оплата картой на сайте при самовывозе из нашего городского Кафе.",
        span: "Оплата картой на сайте при доставке"
    },

    {
        id: 3,
        src: deliveryFoto,
        title: "Доставка",
        description: "В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району"
    },
]


const DeliveryRulesComponent = () => {

    return (
        <div className={styles.containerDeliveryRules}>
            <div className={styles.containerDeliveryRules__content}>
                {rules.map((rule) => (
                    <div
                        className={styles.containerDeliveryRules__content__cards}
                        key={rule.id}
                    >
                        <img
                            className={styles.containerDeliveryRules__content__cards_img}
                            src={rule.src}
                            alt='Наличными в Дали-Хинкали'
                        />

                        <div className={styles.containerDeliveryRules__content__cards_info}>
                            <h2 className={styles.containerDeliveryRules__content__cards_info_h2}>{rule.title}</h2>

                            <p className={styles.containerDeliveryRules__content__cards_info_p}>{rule.description}<span>{rule.span}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DeliveryRulesComponent;