import { Helmet } from "react-helmet";
import AdditionalServicesComponent from "../component/MainComponent/AdditionalServices/additionalServicesComponent";

const AdditionalServicesPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Дали-Хинкали/Доп Услуги</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <AdditionalServicesComponent />
        </div>
    )
}

export default AdditionalServicesPage;