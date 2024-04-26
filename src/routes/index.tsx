import {createAsync, redirect, type RouteDefinition, useNavigate} from "@solidjs/router";
import {getUser} from "~/pages/auth/auth";
import {APP_BASE_URL} from "~/lib/Utils";
import Header from "~/components/website/Header";
import Footer from "~/components/website/Footer";
import '../../css/style.css'
import '../../css/krd.css'
import {Title} from "@solidjs/meta";
import SiteTitle from "~/components/website/utils";
export default function Home() {
    const navigate = useNavigate();
    const user = createAsync(() => getUser(), {deferStream: true});
    if (user()?.id) {
        navigate(`${APP_BASE_URL}`)
    }
    return (
        <>
            <SiteTitle>Home</SiteTitle>
            <Header />
            <section class="hero">
                <div class="heroInner container">
                    <h1 class="m">
                        Think, Drag & Drop <br /> Create forms in minutes
                    </h1>
                    <h4 class="mt-3 mb-5">Create your form — Smoother & faster!</h4>

                    <div class="iconRow mt-2 mb-2">
                        <div class="iconcard">
                            <div class="iconBackground d-flex justify-content-center align-content-center">
                                <svg
                                    width="33"
                                    height="33"
                                    viewBox="0 0 33 33"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clip-path="url(#clip0_2019_135)">
                                        <path
                                            d="M14.2203 13.9439C14.2203 14.4692 14.1168 14.9893 13.9158 15.4747C13.7148 15.96 13.4202 16.4009 13.0487 16.7723C12.6773 17.1438 12.2363 17.4384 11.751 17.6394C11.2657 17.8405 10.7456 17.9439 10.2203 17.9439C9.69501 17.9439 9.17486 17.8405 8.68956 17.6394C8.20426 17.4384 7.7633 17.1438 7.39187 16.7723C7.02044 16.4009 6.7258 15.96 6.52478 15.4747C6.32376 14.9893 6.2203 14.4692 6.2203 13.9439C6.2203 12.883 6.64172 11.8656 7.39187 11.1155C8.14201 10.3653 9.15943 9.94392 10.2203 9.94392C11.2812 9.94392 12.2986 10.3653 13.0487 11.1155C13.7989 11.8656 14.2203 12.883 14.2203 13.9439ZM11.9981 13.9439C11.9981 13.4724 11.8108 13.0202 11.4774 12.6868C11.144 12.3534 10.6918 12.1661 10.2203 12.1661C9.7488 12.1661 9.29662 12.3534 8.96322 12.6868C8.62982 13.0202 8.44252 13.4724 8.44252 13.9439C8.44252 14.4154 8.62982 14.8676 8.96322 15.201C9.29662 15.5344 9.7488 15.7217 10.2203 15.7217C10.6918 15.7217 11.144 15.5344 11.4774 15.201C11.8108 14.8676 11.9981 14.4154 11.9981 13.9439ZM10.2203 27.7217C11.2812 27.7217 12.2986 27.3003 13.0487 26.5501C13.7989 25.8 14.2203 24.7826 14.2203 23.7217C14.2203 22.6608 13.7989 21.6434 13.0487 20.8933C12.2986 20.1431 11.2812 19.7217 10.2203 19.7217C9.15943 19.7217 8.14201 20.1431 7.39187 20.8933C6.64172 21.6434 6.2203 22.6608 6.2203 23.7217C6.2203 24.7826 6.64172 25.8 7.39187 26.5501C8.14201 27.3003 9.15943 27.7217 10.2203 27.7217ZM10.2203 25.4995C9.7488 25.4995 9.29662 25.3122 8.96322 24.9788C8.62982 24.6454 8.44252 24.1932 8.44252 23.7217C8.44252 23.2502 8.62982 22.798 8.96322 22.4646C9.29662 22.1312 9.7488 21.9439 10.2203 21.9439C10.6918 21.9439 11.144 22.1312 11.4774 22.4646C11.8108 22.798 11.9981 23.2502 11.9981 23.7217C11.9981 24.1932 11.8108 24.6454 11.4774 24.9788C11.144 25.3122 10.6918 25.4995 10.2203 25.4995ZM7.33141 5.49947C7.03672 5.49947 6.75411 5.61653 6.54573 5.82491C6.33736 6.03328 6.2203 6.3159 6.2203 6.61058C6.2203 6.90527 6.33736 7.18788 6.54573 7.39626C6.75411 7.60463 7.03672 7.72169 7.33141 7.72169H26.4425C26.7372 7.72169 27.0198 7.60463 27.2282 7.39626C27.4366 7.18788 27.5536 6.90527 27.5536 6.61058C27.5536 6.3159 27.4366 6.03328 27.2282 5.82491C27.0198 5.61653 26.7372 5.49947 26.4425 5.49947H7.33141ZM15.9981 14.1661C15.9981 13.5528 16.4959 13.055 17.1092 13.055H26.4425C26.7372 13.055 27.0198 13.1721 27.2282 13.3805C27.4366 13.5888 27.5536 13.8715 27.5536 14.1661C27.5536 14.4608 27.4366 14.7434 27.2282 14.9518C27.0198 15.1602 26.7372 15.2772 26.4425 15.2772H17.1092C16.4959 15.2772 15.9981 14.7795 15.9981 14.1661ZM17.1092 22.3884C16.8145 22.3884 16.5319 22.5054 16.3235 22.7138C16.1151 22.9222 15.9981 23.2048 15.9981 23.4995C15.9981 23.7942 16.1151 24.0768 16.3235 24.2851C16.5319 24.4935 16.8145 24.6106 17.1092 24.6106H26.4425C26.7372 24.6106 27.0198 24.4935 27.2282 24.2851C27.4366 24.0768 27.5536 23.7942 27.5536 23.4995C27.5536 23.2048 27.4366 22.9222 27.2282 22.7138C27.0198 22.5054 26.7372 22.3884 26.4425 22.3884H17.1092ZM6.44252 0.166138C4.96909 0.166138 3.55602 0.751454 2.51415 1.79332C1.47228 2.83519 0.886963 4.24827 0.886963 5.72169V26.6106C0.886963 28.084 1.47228 29.4971 2.51415 30.539C3.55602 31.5808 4.96909 32.1661 6.44252 32.1661H27.3314C28.8048 32.1661 30.2179 31.5808 31.2598 30.539C32.3016 29.4971 32.887 28.084 32.887 26.6106V5.72169C32.887 4.24827 32.3016 2.83519 31.2598 1.79332C30.2179 0.751454 28.8048 0.166138 27.3314 0.166138H6.44252ZM3.10919 5.72169C3.10919 4.83764 3.46037 3.98979 4.0855 3.36467C4.71062 2.73955 5.55846 2.38836 6.44252 2.38836H27.3314C28.2155 2.38836 29.0633 2.73955 29.6884 3.36467C30.3136 3.98979 30.6647 4.83764 30.6647 5.72169V26.6106C30.6647 27.4946 30.3136 28.3425 29.6884 28.9676C29.0633 29.5927 28.2155 29.9439 27.3314 29.9439H6.44252C5.55846 29.9439 4.71062 29.5927 4.0855 28.9676C3.46037 28.3425 3.10919 27.4946 3.10919 26.6106V5.72169Z"
                                            fill="black"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_2019_135">
                                            <rect
                                                width="32"
                                                height="32"
                                                fill="white"
                                                transform="translate(0.886963 0.166138)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <i class=" icon fa-solid fa-file"></i>
                            </div>
                            <p class="pt-2">
                                Contact <br /> Form
                            </p>
                        </div>
                        <div class="iconcard">
                            <div class="iconBackground d-flex justify-content-center align-content-center">
                                <svg
                                    width="44"
                                    height="25"
                                    viewBox="0 0 44 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clip-path="url(#clip0_2017_97)">
                                        <path
                                            d="M28.715 12.9724C27.9201 12.9689 27.1441 12.7304 26.4843 12.2871L19.9134 7.90645C19.6527 7.69642 19.4797 7.39662 19.4285 7.06576C19.3772 6.73489 19.4513 6.39681 19.6362 6.11771C19.8212 5.83861 20.1036 5.63861 20.4283 5.55688C20.753 5.47514 21.0965 5.51756 21.3915 5.67583L27.9759 10.0565C28.1953 10.2009 28.4523 10.2779 28.715 10.2779C28.9777 10.2779 29.2346 10.2009 29.454 10.0565L36.0384 5.67583C36.3335 5.51756 36.677 5.47514 37.0016 5.55688C37.3263 5.63861 37.6088 5.83861 37.7937 6.11771C37.9787 6.39681 38.0528 6.73489 38.0015 7.06576C37.9502 7.39662 37.7773 7.69642 37.5165 7.90645L30.9456 12.2871C30.2859 12.7304 29.5098 12.9689 28.715 12.9724Z"
                                            fill="black"
                                        />
                                        <path
                                            d="M39.4648 24.2599H17.9648C16.8957 24.2599 15.8703 23.8352 15.1143 23.0792C14.3583 22.3232 13.9336 21.2978 13.9336 20.2286V4.10364C13.9336 3.03448 14.3583 2.00912 15.1143 1.25311C15.8703 0.497108 16.8957 0.0723877 17.9648 0.0723877H39.4648C40.534 0.0723877 41.5594 0.497108 42.3154 1.25311C43.0714 2.00912 43.4961 3.03448 43.4961 4.10364V20.2286C43.4961 21.2978 43.0714 22.3232 42.3154 23.0792C41.5594 23.8352 40.534 24.2599 39.4648 24.2599ZM17.9648 2.75989C17.6085 2.75989 17.2667 2.90146 17.0147 3.15346C16.7627 3.40547 16.6211 3.74725 16.6211 4.10364V20.2286C16.6211 20.585 16.7627 20.9268 17.0147 21.1788C17.2667 21.4308 17.6085 21.5724 17.9648 21.5724H39.4648C39.8212 21.5724 40.163 21.4308 40.415 21.1788C40.667 20.9268 40.8086 20.585 40.8086 20.2286V4.10364C40.8086 3.74725 40.667 3.40547 40.415 3.15346C40.163 2.90146 39.8212 2.75989 39.4648 2.75989H17.9648Z"
                                            fill="black"
                                        />
                                        <path
                                            d="M9.90234 16.1974H7.21484C6.85846 16.1974 6.51667 16.0558 6.26467 15.8038C6.01267 15.5518 5.87109 15.21 5.87109 14.8536C5.87109 14.4973 6.01267 14.1555 6.26467 13.9035C6.51667 13.6515 6.85846 13.5099 7.21484 13.5099H9.90234C10.2587 13.5099 10.6005 13.6515 10.8525 13.9035C11.1045 14.1555 11.2461 14.4973 11.2461 14.8536C11.2461 15.21 11.1045 15.5518 10.8525 15.8038C10.6005 16.0558 10.2587 16.1974 9.90234 16.1974Z"
                                            fill="black"
                                        />
                                        <path
                                            d="M9.90234 10.8224H4.52734C4.17096 10.8224 3.82917 10.6808 3.57717 10.4288C3.32517 10.1768 3.18359 9.83502 3.18359 9.47864C3.18359 9.12225 3.32517 8.78047 3.57717 8.52846C3.82917 8.27646 4.17096 8.13489 4.52734 8.13489H9.90234C10.2587 8.13489 10.6005 8.27646 10.8525 8.52846C11.1045 8.78047 11.2461 9.12225 11.2461 9.47864C11.2461 9.83502 11.1045 10.1768 10.8525 10.4288C10.6005 10.6808 10.2587 10.8224 9.90234 10.8224Z"
                                            fill="black"
                                        />
                                        <path
                                            d="M9.90234 5.44739H1.83984C1.48346 5.44739 1.14167 5.30581 0.889669 5.05381C0.637667 4.80181 0.496094 4.46002 0.496094 4.10364C0.496094 3.74725 0.637667 3.40547 0.889669 3.15346C1.14167 2.90146 1.48346 2.75989 1.83984 2.75989H9.90234C10.2587 2.75989 10.6005 2.90146 10.8525 3.15346C11.1045 3.40547 11.2461 3.74725 11.2461 4.10364C11.2461 4.46002 11.1045 4.80181 10.8525 5.05381C10.6005 5.30581 10.2587 5.44739 9.90234 5.44739Z"
                                            fill="black"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_2017_97">
                                            <rect
                                                width="43"
                                                height="24.1875"
                                                fill="white"
                                                transform="translate(0.496094 0.0723877)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <p class="pt-2">
                                Sign Up <br /> Form
                            </p>
                        </div>
                        <div class="iconcard">
                            <div class="iconBackground d-flex justify-content-center align-content-center">
                                <svg
                                    width="28"
                                    height="33"
                                    viewBox="0 0 28 33"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clip-path="url(#clip0_2017_90)">
                                        <path
                                            d="M24.2651 5.43471H21.3165V2.98899C21.3165 2.24033 21.0191 1.52232 20.4897 0.992934C19.9604 0.463545 19.2424 0.166138 18.4937 0.166138H3.56797C2.81931 0.166138 2.1013 0.463545 1.57191 0.992934C1.04252 1.52232 0.745117 2.24033 0.745117 2.98899V24.0747C0.745117 24.8234 1.04252 25.5414 1.57191 26.0708C2.1013 26.6002 2.81931 26.8976 3.56797 26.8976H6.89369V28.9661C6.89369 29.3864 6.97646 29.8025 7.13727 30.1907C7.29809 30.579 7.5338 30.9317 7.83095 31.2289C8.1281 31.526 8.48086 31.7617 8.8691 31.9226C9.25734 32.0834 9.67346 32.1661 10.0937 32.1661H24.2651C24.6853 32.1661 25.1015 32.0834 25.4897 31.9226C25.8779 31.7617 26.2307 31.526 26.5279 31.2289C26.825 30.9317 27.0607 30.579 27.2215 30.1907C27.3823 29.8025 27.4651 29.3864 27.4651 28.9661V8.63471C27.4651 7.78602 27.128 6.97208 26.5279 6.37197C25.9277 5.77185 25.1138 5.43471 24.2651 5.43471ZM3.56797 24.7604C3.38504 24.7605 3.20943 24.6886 3.07902 24.5603C2.9486 24.432 2.87383 24.2576 2.87083 24.0747V2.98899C2.87383 2.80609 2.9486 2.63169 3.07902 2.50341C3.20943 2.37513 3.38504 2.30326 3.56797 2.30328H18.4937C18.6766 2.30326 18.8522 2.37513 18.9826 2.50341C19.1131 2.63169 19.1878 2.80609 19.1908 2.98899V5.43471H10.048C9.19928 5.43471 8.38535 5.77185 7.78523 6.37197C7.18512 6.97208 6.84797 7.78602 6.84797 8.63471V24.7604H3.56797ZM25.2823 28.9661C25.2793 29.2491 25.1647 29.5194 24.9636 29.7184C24.7625 29.9174 24.4909 30.029 24.208 30.029H10.0937C9.81074 30.029 9.53921 29.9174 9.33807 29.7184C9.13692 29.5194 9.02241 29.2491 9.0194 28.9661V8.63471C9.02241 8.35178 9.13692 8.08145 9.33807 7.88245C9.53921 7.68345 9.81074 7.57184 10.0937 7.57185H24.2651C24.5481 7.57184 24.8196 7.68345 25.0207 7.88245C25.2219 8.08145 25.3364 8.35178 25.3394 8.63471L25.2823 28.9661Z"
                                            fill="black"
                                        />
                                        <path
                                            d="M22.6652 15.0976H11.6937C11.5441 15.0821 11.3929 15.0982 11.2499 15.1448C11.1069 15.1915 10.9753 15.2676 10.8636 15.3683C10.7519 15.4691 10.6626 15.5921 10.6015 15.7296C10.5404 15.867 10.5088 16.0157 10.5088 16.1661C10.5088 16.3166 10.5404 16.4653 10.6015 16.6027C10.6626 16.7402 10.7519 16.8632 10.8636 16.9639C10.9753 17.0647 11.1069 17.1408 11.2499 17.1875C11.3929 17.2341 11.5441 17.2502 11.6937 17.2347H22.6652C22.8148 17.2502 22.966 17.2341 23.109 17.1875C23.252 17.1408 23.3836 17.0647 23.4953 16.9639C23.607 16.8632 23.6963 16.7402 23.7574 16.6027C23.8185 16.4653 23.8501 16.3166 23.8501 16.1661C23.8501 16.0157 23.8185 15.867 23.7574 15.7296C23.6963 15.5921 23.607 15.4691 23.4953 15.3683C23.3836 15.2676 23.252 15.1915 23.109 15.1448C22.966 15.0982 22.8148 15.0821 22.6652 15.0976Z"
                                            fill="black"
                                        />
                                        <path
                                            d="M22.6652 15.0976H11.6937C11.5441 15.0821 11.3929 15.0982 11.2499 15.1448C11.1069 15.1915 10.9753 15.2676 10.8636 15.3683C10.7519 15.4691 10.6626 15.5921 10.6015 15.7296C10.5404 15.867 10.5088 16.0157 10.5088 16.1661C10.5088 16.3166 10.5404 16.4653 10.6015 16.6027C10.6626 16.7401 10.7519 16.8632 10.8636 16.9639C10.9753 17.0647 11.1069 17.1408 11.2499 17.1875C11.3929 17.2341 11.5441 17.2502 11.6937 17.2347H22.6652C22.8148 17.2502 22.966 17.2341 23.109 17.1875C23.252 17.1408 23.3836 17.0647 23.4953 16.9639C23.607 16.8632 23.6963 16.7401 23.7574 16.6027C23.8185 16.4653 23.8501 16.3166 23.8501 16.1661C23.8501 16.0157 23.8185 15.867 23.7574 15.7296C23.6963 15.5921 23.607 15.4691 23.4953 15.3683C23.3836 15.2676 23.252 15.1915 23.109 15.1448C22.966 15.0982 22.8148 15.0821 22.6652 15.0976Z"
                                            fill="black"
                                        />
                                        <path
                                            d="M22.6651 15.1033H11.6937C11.4118 15.1033 11.1415 15.2153 10.9422 15.4146C10.7428 15.6139 10.6309 15.8843 10.6309 16.1661C10.6309 16.448 10.7428 16.7184 10.9422 16.9177C11.1415 17.117 11.4118 17.229 11.6937 17.229H22.6651C22.947 17.229 23.2174 17.117 23.4167 16.9177C23.616 16.7184 23.728 16.448 23.728 16.1661C23.728 15.8843 23.616 15.6139 23.4167 15.4146C23.2174 15.2153 22.947 15.1033 22.6651 15.1033Z"
                                            fill="black"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_2017_90">
                                            <rect
                                                width="27.4286"
                                                height="32"
                                                fill="white"
                                                transform="translate(0.390869 0.166138)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <p class="pt-2">
                                50+ <br /> Templates
                            </p>
                        </div>
                        <div class="iconcard">
                            <div class="iconBackground d-flex justify-content-center align-content-center">
                                <svg
                                    width="33"
                                    height="33"
                                    viewBox="0 0 33 33"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clip-path="url(#clip0_2167_1199)">
                                        <path
                                            d="M30.6091 26.1661H2.60913V28.1661H30.6091V26.1661Z"
                                            fill="black"
                                        />
                                        <path
                                            d="M26.0091 9.16614C26.8091 8.36614 26.8091 7.16614 26.0091 6.36614L22.4091 2.76614C21.6091 1.96614 20.4091 1.96614 19.6091 2.76614L4.60913 17.7661V24.1661H11.0091L26.0091 9.16614ZM21.0091 4.16614L24.6091 7.76614L21.6091 10.7661L18.0091 7.16614L21.0091 4.16614ZM6.60913 22.1661V18.5661L16.6091 8.56614L20.2091 12.1661L10.2091 22.1661H6.60913Z"
                                            fill="black"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_2167_1199">
                                            <rect
                                                width="32"
                                                height="32"
                                                fill="white"
                                                transform="translate(0.609131 0.166138)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <p class="pt-2">
                                40+ <br /> Input Style
                            </p>
                        </div>
                    </div>
                    <div class="heroCTA mt-5 align-item-center">
                        <button class="btn-mid-icon-filled bg-pink">
                            Get Easy Form Forge
                        </button>
                        <a class="pb-05 btn-underline h3" href="#">
                            Explorer Features <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </section>
            <section class="video container d-grid">
                <img src="graphics/videohome.png" alt="image" />

                <div class="userandreview mt-5 mb-5">
                    <div class="activeusers">
                        <img src="graphics/active%20users.png" alt="activeusericon" />
                        <p>
                            20000+ <br /> Active users
                        </p>
                    </div>

                    <div class="reviews">
                        <img src="graphics/review.png" alt="reviewicon" />
                        <p>
                            4.9/5 Stars <br /> 421 Review
                        </p>
                    </div>
                </div>
            </section>
            <section class="features container pb-5 pt-5">
                <div class="featureHeadingsec d-flex ">
                    <h2 class="text-left">
                        Experience a whole new & <br /> quicker way of making forms!
                    </h2>
                    <button class="btn-small-icon-filled bg-black">
                        View All Features <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
                <p class="font-600 mt-3">
                    Easy Form Forge serves everyone’s needs by out of the box like
                </p>

                <div class="row mt-5 d-flex justify-content-spacebetween">
                    <div class="featurebox d-flex p-relative ">
                        <div class="iconbg"></div>
                        <div class="iconsvg d-flex justify-content-center align-item-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="56"
                                height="56"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fill="#000000"
                                    d="M19 5.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M14.5 3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25M17 14.5v-4.1a5.507 5.507 0 0 0 1-.657V14.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 14.5v-8A2.5 2.5 0 0 1 4.5 4h4.707a5.48 5.48 0 0 0-.185 1H4.5A1.5 1.5 0 0 0 3 6.5v.302l7 4.118l1.441-.848a5.49 5.49 0 0 0 1.043.547l-2.23 1.312a.5.5 0 0 1-.426.038l-.082-.038L3 7.963V14.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5"
                                />
                            </svg>
                        </div>

                        <h6>Spam Protection</h6>
                        <h4 class="text-left">
                            Google reCAPTCHA <br /> Spam Protection
                        </h4>
                        <p>
                            This will prevents spam entries and ensures acquiring real data
                            from users
                        </p>
                    </div>
                    <div class="featurebox d-flex p-relative ">
                        <div class="iconbg"></div>
                        <div class="iconsvg d-flex justify-content-center align-item-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="56"
                                height="56"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="#000000"
                                    d="M12 16.5a.75.75 0 0 1 .744.648l.007.102v2.188l.72-.718a.75.75 0 0 1 .976-.073l.084.073a.75.75 0 0 1 .072.976l-.072.084l-2 2l-.038.036l-.072.055l-.095.055l-.087.035l-.102.026l-.085.011h-.103l-.12-.018l-.068-.02l-.059-.022l-.07-.035l-.052-.032l-.031-.022a.754.754 0 0 1-.079-.069l-2-2a.75.75 0 0 1 .977-1.133l.084.073l.72.719v-2.19a.75.75 0 0 1 .648-.742zM12 9a3 3 0 1 1 0 6a3 3 0 0 1 0-6m6.72.47a.75.75 0 0 1 .977-.073l.084.072l2 2l.036.039l.055.072l.055.095l.035.086l.026.103l.01.084v.103l-.017.12l-.02.068l-.022.059l-.035.07l-.032.052l-.028.038l-.063.072l-2 2a.75.75 0 0 1-1.133-.976l.072-.085l.719-.72H17.25a.75.75 0 0 1-.744-.647L16.501 12a.75.75 0 0 1 .648-.743l.102-.007h2.189l-.72-.72a.75.75 0 0 1-.072-.976zm-14.5 0a.75.75 0 0 1 1.134.976l-.073.084l-.72.72h2.19a.75.75 0 0 1 .743.648L7.5 12a.75.75 0 0 1-.649.743l-.101.007H4.56l.72.72a.75.75 0 0 1 .073.976l-.073.084a.75.75 0 0 1-.977.073l-.084-.073l-2-2l-.09-.11l-.055-.095l-.036-.086l-.026-.103l-.011-.09v-.093l.018-.125l.02-.067l.022-.06l.035-.07l.032-.052l.023-.03a.754.754 0 0 1 .068-.08zM12 10.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m-.136-8.488l.067-.009l.087-.003l.06.004l.094.016l.068.019l.059.022l.07.036l.052.032l.038.027l.072.063l2 2a.75.75 0 0 1-.977 1.134l-.084-.073l-.72-.72v2.19a.75.75 0 0 1-.648.743l-.101.007a.75.75 0 0 1-.744-.648l-.006-.102V4.56l-.72.72a.75.75 0 0 1-.977.073L9.47 5.28a.75.75 0 0 1-.072-.976l.072-.085l2-2l.11-.09l.095-.055l.087-.035z"
                                />
                            </svg>
                        </div>

                        <h6>Builder</h6>
                        <h4 class="text-left">
                            Drag & Drop <br />
                            Builder
                        </h4>
                        <p>
                            Fully functional drag & drop form builder. And so many widgets in
                            addition
                        </p>
                    </div>
                    <div class="featurebox d-flex p-relative ">
                        <div class="iconbg"></div>
                        <div class="iconsvg d-flex justify-content-center align-item-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="56"
                                height="56"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="#000000"
                                    d="M15.75 14.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zM2 8.25A3.25 3.25 0 0 1 5.25 5h13.5A3.25 3.25 0 0 1 22 8.25v7.5A3.25 3.25 0 0 1 18.75 19H5.25A3.25 3.25 0 0 1 2 15.75zM20.5 9.5V8.25a1.75 1.75 0 0 0-1.75-1.75H5.25A1.75 1.75 0 0 0 3.5 8.25V9.5zM3.5 11v4.75c0 .966.784 1.75 1.75 1.75h13.5a1.75 1.75 0 0 0 1.75-1.75V11z"
                                />
                            </svg>
                        </div>

                        <h6>Payment Methods</h6>
                        <h4 class="text-left">
                            Wide Range of Payment <br /> Methods
                        </h4>
                        <p>
                            Supports popular payment gateway integration like Paypal, Stripe,
                            Gpay and more!
                        </p>
                    </div>
                </div>

                <div class="row mt-4 d-flex justify-content-spacebetween">
                    <div class="featurebox d-flex p-relative ">
                        <div class="iconbg"></div>
                        <div class="iconsvg d-flex justify-content-center align-item-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="56"
                                height="56"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="#000000"
                                    d="M13 19c0-.34.04-.67.09-1H4V8l8 5l8-5v5.09c.72.12 1.39.37 2 .72V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9.09c-.05-.33-.09-.66-.09-1m7-13l-8 5l-8-5zm-2.25 16.16l-2.75-3L16.16 18l1.59 1.59L21.34 16l1.16 1.41z"
                                />
                            </svg>
                        </div>

                        <h6>Confirmation Email</h6>
                        <h4 class="text-left">
                            Confirmation Email to <br /> Form Users
                        </h4>
                        <p>
                            Set email notifications to users as a confirmation once form
                            submission is successful{" "}
                        </p>
                    </div>
                    <div class="featurebox d-flex p-relative ">
                        <div class="iconbg"></div>
                        <div class="iconsvg d-flex justify-content-center align-item-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="56"
                                height="56"
                                viewBox="0 0 24 24"
                            >
                                <g fill="none">
                                    <path d="M0 0h24v24H0z" />
                                    <path
                                        fill="#000000"
                                        d="M14.486 3.143a1 1 0 0 1 .692 1.233l-4.43 15.788a1 1 0 0 1-1.926-.54l4.43-15.788a1 1 0 0 1 1.234-.693M7.207 7.05a1 1 0 0 1 0 1.414L3.672 12l3.535 3.535a1 1 0 1 1-1.414 1.415L1.55 12.707a1 1 0 0 1 0-1.414L5.793 7.05a1 1 0 0 1 1.414 0m9.586 1.414a1 1 0 1 1 1.414-1.414l4.243 4.243a1 1 0 0 1 0 1.414l-4.243 4.243a1 1 0 0 1-1.414-1.415L20.328 12z"
                                    />
                                </g>
                            </svg>
                        </div>

                        <h6>Shortcode</h6>
                        <h4 class="text-left">
                            Shortcode Support for <br /> Customization
                        </h4>
                        <p>Add short codes to show custom fields in the forms</p>
                    </div>
                    <div class="featurebox d-flex p-relative ">
                        <div class="iconbg"></div>
                        <div class="iconsvg d-flex justify-content-center align-item-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="56"
                                height="56"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="#000000"
                                    d="m2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.06 2.19 1.09 2.61m19.5-3.7L17.07 4a2 2 0 0 0-1.81-1.25c-.26 0-.53.04-.79.15L7.1 5.95a2.02 2.02 0 0 0-1.23 1.8c-.01.25.04.54.13.8l5 11.95c.29.78 1.03 1.24 1.81 1.25c.26 0 .52-.05.77-.15l7.36-3.05a1.994 1.994 0 0 0 1.09-2.6M7.88 8.75a1 1 0 0 1-1-1a1 1 0 0 1 1-1c.55 0 1 .45 1 1s-.45 1-1 1m-2 11a2 2 0 0 0 2 2h1.45l-3.45-8.34z"
                                />
                            </svg>
                        </div>

                        <h6>Visual Styler</h6>
                        <h4 class="text-left">
                            Choose form look from <br /> hundreds of ready made style
                        </h4>
                        <p>
                            Getting your forms to look amazing in your desired color is no
                            longer difficult.
                        </p>
                    </div>
                </div>
            </section>
            <section class="forminaction pt-100 pb-100 bg-info-300">
                <div class="container">
                    <h2 class="text-left">
                        Watch <span class="color-info">EasyFormForge</span> form in action!
                    </h2>
                    <p class="font-600 mt-2">
                        Build any form instantly using all the features
                    </p>

                    <div class="formsecparent mt-5">
                        <div class="formtypes">
                            <ul>
                                <li>
                                    <a href="#">Contact form</a> <span>(2)</span>
                                </li>
                                <li>
                                    <a href="#">Quiz form</a> <span>(1)</span>
                                </li>
                                <li>
                                    <a href="#">Feedback form</a> <span>(4)</span>
                                </li>
                                <li>
                                    <a href="#">Admission form</a> <span>(6)</span>
                                </li>
                                <li>
                                    <a href="#">Newsletter form</a> <span>(3)</span>
                                </li>
                                <li>
                                    <a href="#">LogIn form</a> <span>(2)</span>
                                </li>
                                <li>
                                    <a href="#">SignUp form</a> <span>(1)</span>
                                </li>
                                <li>
                                    <a href="#">All form cotrol</a> <span>(2)</span>
                                </li>
                            </ul>
                        </div>

                        <div class="formsection">
                            <div class="formtitle">
                                <a class="btn-mid-icon-filled" href="#">
                                    Demo style 1
                                </a>
                                <a class="btn-transperant bg-transperant " href="#">
                                    Demo style 2
                                </a>
                            </div>

                            <div class="actualform">
                                <form action="#">
                                    <label for="fname">First Name</label>
                                    <input
                                        type="text"
                                        id="fname"
                                        name="firstname"
                                        placeholder="Your name.."
                                    />

                                    <label for="lname">Last Name</label>
                                    <input
                                        type="text"
                                        id="lname"
                                        name="lastname"
                                        placeholder="Your last name.."
                                    />

                                    <label for="country">Country</label>
                                    <select id="country" name="country">
                                        <option value="australia">Australia</option>
                                        <option value="canada">Canada</option>
                                        <option value="usa">USA</option>
                                    </select>

                                    <label for="subject">Subject</label>
                                    <textarea
                                        id="subject"
                                        name="subject"
                                        placeholder="Write something.."
                                        style="height:200px"
                                    ></textarea>

                                    <input
                                        class="btn-small-icon-filled"
                                        type="submit"
                                        value="Submit"
                                    />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="subscribe d-flex">
                <div class="subscribeinner container">
                    <h2 class="color-white">Let’s build forms together</h2>
                    <p class="color-white text-center">
                        Subscribe for latest news and exclusive deals!
                    </p>

                    <form class="subs d-flex m-auto mt-3">
                        <input
                            class="p-0 m-0"
                            type="text"
                            placeholder="Enter your email..."
                        />
                        <button
                            class="btn-mid-icon-filled align-item-center bg-pink"
                            type="submit"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
            <section class="faq container d-flex pt-100 pb-100">
                <h2>Frequently Asked Questions & Resources</h2>
                <p class="text-center pt-2">
                    We get it - Here're some frequently asked questions <br /> to help you
                    along the way
                </p>

                <div class="accordionParent d-grid justify-content-center pt-5">
                    <button class="accordion h5 mb-1">
                        <i class="fa-solid fa-square pr-1"></i>Do I need knowledge of coding
                        to Use EasyFormForge?{" "}
                        <span>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
                    </button>
                    <div class="panel">
                        <p>
                            Absolutely not. You don’t need any coding skills required to use
                            the EasyFormForge. It is a complete drag-and-drop form builder.
                        </p>
                    </div>

                    <button class="accordion h5 mb-1">
                        <i class="fa-solid fa-square pr-1"></i>Does EasyFormForge have any
                        video documentation?
                        <span>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
                    </button>
                    <div class="panel">
                        <p>
                            Absolutely Yes. Check our official YouTube channel for more
                            information.
                        </p>
                    </div>

                    <button class="accordion h5 mb-1">
                        <i class="fa-solid fa-square pr-1"></i>What happens after the
                        subscription expires?
                        <span>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
                    </button>
                    <div class="panel">
                        <p>
                            {" "}
                            In that case our system will send the notification to you several
                            times to renew your subscription. In case you decide not to renew
                            it, no worries. You will still be able to access old data and
                            forms.
                        </p>
                    </div>

                    <button class="accordion h5 mb-1">
                        <i class="fa-solid fa-square pr-1"></i>How long do I get support?
                        <span>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
                    </button>
                    <div class="panel">
                        <p>We are open 24x7 every day for you!</p>
                    </div>

                    <button class="accordion h5 mb-1">
                        <i class="fa-solid fa-square pr-1"></i>Do you offer refunds?
                        <span>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
                    </button>
                    <div class="panel">
                        <p>
                            We are sure that you will love EasyFormForge. However, if you are
                            not satisfied with our product, within 7 days, you’re more than
                            welcome to get a full refund!?
                        </p>
                    </div>
                </div>
            </section>
            <section class="testimonial">
                <div class="testimonialinner container pt-100 pb-5">
                    <h2>
                        What people have said <br /> about the product
                    </h2>
                    <p class="text-center">
                        People fell in ❤️ with EasyFormForge, Here’s the proof!
                    </p>

                    <div class="row pt-5 d-flex justify-content-spacebetween">
                        <div class="personaltestimonial">
                            <p class="ratestar">
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                            </p>
                            <h4>Great form builder</h4>
                            <p>
                                EasyFormForge works great. Designing a form is really easy, the
                                form works well, and the formatting of submission emails looks
                                great as well. Really great product.
                            </p>
                            <h5 class="clientname">Tom Wilson</h5>
                            <h6 class="profession">Primary Teacher</h6>
                        </div>
                        <div class="personaltestimonial">
                            <p class="ratestar">
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                            </p>
                            <h4>Great form builder</h4>
                            <p>
                                EasyFormForge works great. Designing a form is really easy, the
                                form works well, and the formatting of submission emails looks
                                great as well. Really great product.
                            </p>
                            <h5 class="clientname">Tom Wilson</h5>
                            <h6 class="profession">Primary Teacher</h6>
                        </div>
                        <div class="personaltestimonial">
                            <p class="ratestar">
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                            </p>
                            <h4>Great form builder</h4>
                            <p>
                                EasyFormForge works great. Designing a form is really easy, the
                                form works well, and the formatting of submission emails looks
                                great as well. Really great product.
                            </p>
                            <h5 class="clientname">Tom Wilson</h5>
                            <h6 class="profession">Primary Teacher</h6>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center mt-5">
                        <a class="btn-underline" href="#">
                            See more reviews <i class="fa-solid fa-chevron-right"></i>
                        </a>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}
