import { Helmet } from "react-helmet";
import BiznesLanchComponent from "../component/MainComponent/BiznesLanch/biznesLanchComponent";

const BiznesLanchPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Дали-Хинкали/Бизнес-Ланч</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <BiznesLanchComponent />
        </div>
    )
}

export default BiznesLanchPage;