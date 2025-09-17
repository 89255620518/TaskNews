import { PrivacyPolicy } from "../component/Footer/Policy/policy";
import { Helmet } from "react-helmet";

const KonfidiPage = () => {

    return (
        <>
            <Helmet>
                <title>Дали-Хинкали/ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <PrivacyPolicy />
        </>
    )
}

export default KonfidiPage;