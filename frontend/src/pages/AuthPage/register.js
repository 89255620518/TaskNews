import RegisterComponent from "../../component/AuthComponent/RegisterComponent/registerComponent";
import { Helmet } from "react-helmet";

const RegisterPage = () => {


    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>ТЗ/Регистрация</title>
            </Helmet>
            <RegisterComponent />
        </div>
    )
}

export default RegisterPage;