import RegisterComponent from "../component/AuthComponent/RegisterComponent/registerComponent";
import { Helmet } from "react-helmet";

const RegisterPage = () => {


    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Дали-Хинкали/Регистрация</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <RegisterComponent />
        </div>
    )
}

export default RegisterPage;