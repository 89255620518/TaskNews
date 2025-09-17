import o from './infoPay.module.scss'


export default function OplataInfo() {
    return (
        <>
            <section className={o.section__oplata}>
                <div className={o.section__container}>
                    <p className={o.oplata__title}>
                        Оплата
                    </p>
                    <div className={o.oplata}>
                        <div className={o.oplata__item}>
                            <p className={o.oplata__text}>
                                1. Выбираем товары
                            </p>

                            <p className={o.oplata__text}>
                                2. Переходим на страницу карзины
                            </p>

                            <p className={o.oplata__text}>
                                3. Далее заполняем свои данные и заказываем
                            </p>

                            <p className={o.oplata__text}>
                                4. Если  выбрали "Оплата онлайн", то вы автоматически переходите на страницу онлайн оплаты
                            </p>

                            <p className={o.oplata__text}>
                                5. Так же можно отслеживать свои заказы, в правом левом углу переходите в админку и выбираете раздел 'Мои заказы'
                            </p>
                        </div>

                        <div className={o.oplata__item}>
                            <p className={o.oplata__text}>
                                6. Чтобы сделать возврат товара, перейдите на страницу "Возврат"
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}