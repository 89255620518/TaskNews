import { Helmet } from "react-helmet";
import CabinetComponent from "../component/CabinetComponent/cabinetComponent";

const CabinetPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Дали-Хинкали/Личный кабинет</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <CabinetComponent />
        </div>
    )
}

export default CabinetPage;