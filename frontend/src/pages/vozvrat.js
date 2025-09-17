import { Vozvrat } from "../component/Footer/infoPay/vozvratComponent";
import { Helmet } from "react-helmet";

const VozvratPage = () => {

    return (
        <>
            <Helmet>
                <title>Дали-Хинкали/Возврат</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <Vozvrat />
        </>
    )
}

export default VozvratPage;