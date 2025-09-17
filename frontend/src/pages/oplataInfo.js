
import { Helmet } from "react-helmet";
import { PayRull } from "../component/Footer/infoPay/oplataInfoComponent";

const OplataInfoPage = () => {

    return (
        <>
            <Helmet>
                <title>Дали-Хинкали/Правила Оплаты</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <PayRull />
        </>
    )
}

export default OplataInfoPage;