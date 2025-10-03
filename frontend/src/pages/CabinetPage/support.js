import { Helmet } from "react-helmet";
import SupportComponent from "../../component/Cabinet/SupportComponent/supportComponent";

const SupportPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>ТЗ/Панель служба поддержки</title>
            </Helmet>
            <SupportComponent />
        </div>
    )
}

export default SupportPage;