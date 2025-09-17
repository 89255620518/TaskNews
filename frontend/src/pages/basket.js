import { Helmet } from "react-helmet";
import BasketComponent from "../component/BasketComponent/basketComponent";

const BasketPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Дали-Хинкали/Корзина</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <BasketComponent />
        </div>
    )
}

export default BasketPage;