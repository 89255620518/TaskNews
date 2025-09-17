import OplataInfo from "../component/Footer/infoPay/payComponent";
import { Helmet } from "react-helmet";

const PayPage = () => {

    return (
        <>
            <Helmet>
                <title>Дали-Хинкали/Оплата</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <OplataInfo />
        </>
    )
}

export default PayPage;