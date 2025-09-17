import LoginComponent from "../component/AuthComponent/LoginComponent/loginComponent";
import { Helmet } from "react-helmet";


const LoginPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Дали-Хинкали/Авторизация</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <LoginComponent />
        </div>
    )
}

export default LoginPage;