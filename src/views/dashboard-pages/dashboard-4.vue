<template>
    <b-row>
        <b-col sm="12">
            <b-row>
                <b-col md="6" lg="3">
                    <b-card no-body class="card-block card-stretch card-height ">
                        <b-card-body class="d-flex">
                            <div class="d-flex align-items-center justify-content-between flex-grow-1">
                                <div class="text-left">
                                    <h4 class="mb-2 mt-2">Confirm</h4>
                                    <h3 class="mb-0 line-height counter"><vue3-autocounter ref="counter"
                                            :start-amount="0" :end-amount="183325" separator="," :duration="3" />
                                    </h3>
                                </div>
                                <div class="rounded-circle card-icon bg-primary"><i class="ri-task-line text-white"></i>
                                </div>
                            </div>
                        </b-card-body>
                    </b-card>
                </b-col>
                <b-col md="6" lg="3">
                    <b-card no-body class="card-block card-stretch card-height ">
                        <b-card-body class="d-flex">
                            <div class="d-flex align-items-center justify-content-between flex-grow-1">
                                <div class="text-left">
                                    <h4 class="mb-2 mt-2">Recovered</h4>
                                    <h3 class="mb-0 line-height counter"><vue3-autocounter ref="counter"
                                            :start-amount="0" :end-amount="79908" separator="," :duration="3" />
                                    </h3>
                                </div>
                                <div class="rounded-circle card-icon bg-warning"><i
                                        class="ri-hospital-line text-white"></i>
                                </div>
                            </div>
                        </b-card-body>
                    </b-card>
                </b-col>
                <b-col md="6" lg="3">
                    <b-card no-body class="card-block card-stretch card-height ">
                        <b-card-body class="d-flex">
                            <div class="d-flex align-items-center justify-content-between flex-grow-1">
                                <div class="text-left">
                                    <h4 class="mb-2 mt-2">Death</h4>
                                    <h3 class="mb-0 line-height counter"><vue3-autocounter ref="counter"
                                            :start-amount="0" :end-amount="7177" separator="," :duration="3" />
                                    </h3>
                                </div>
                                <div class="rounded-circle card-icon bg-danger"><i
                                        class="ri-gradienter-line text-white"></i>
                                </div>
                            </div>
                        </b-card-body>
                    </b-card>
                </b-col>
                <b-col md="6" lg="3">
                    <b-card no-body class="card-block card-stretch card-height ">
                        <b-card-body class="P-0 rounded"
                            :style="`background:  url(${generateImgPath('/assets/images/page-img/44.png')}) no-repeat scroll center center; background-size: contain; min-height: 127px;`">
                        </b-card-body>
                    </b-card>
                </b-col>
            </b-row>
        </b-col>
        <b-col sm="12">
            <b-card no-body class="card-block card-stretch card-height ">
                <b-card-body>
                    <div id="world-map" style="height: 400px;"></div>
                </b-card-body>
            </b-card>
        </b-col>
        <b-col lg="8">
            <b-card no-body class="card-block card-stretch card-height ">
                <b-card-header class="d-flex justify-content-between">
                    <div class="header-title">
                        <b-card-title>Global Record</b-card-title>
                    </div>
                </b-card-header>
                <b-card-body class="pt-0">
                    <div class="table-responsive mb-0">
                        <table class="table mb-0 table-borderless">
                            <thead>
                                <tr>
                                    <th scope="col">Country</th>
                                    <th scope="col">Confirm</th>
                                    <th scope="col">Recover</th>
                                    <th scope="col">Death</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="country in countries" :key="country.name">
                                    <td>
                                        <img :src="generateImgPath(`/assets/images/small/${country.flag}`)"
                                            class="img-fluid" alt="country-flag">
                                        {{ country.name }}
                                    </td>
                                    <td>{{ country.confirm }}</td>
                                    <td>{{ country.recover }}</td>
                                    <td>{{ country.death }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </b-card-body>
            </b-card>
        </b-col>
        <b-col lg="4">
            <b-card no-body class="card-block card-stretch card-height ">
                <b-card-header class="d-flex justify-content-between">
                    <div class="header-title">
                        <b-card-title>How to Avoid Virus Infection</b-card-title>
                    </div>
                </b-card-header>
                <b-card-body>
                    <div v-for="tip in healthTips" :key="tip.title"
                        :class="`d-flex ${tip.marginBottom === false ? '' : 'mb-4'}`">
                        <img :src="generateImgPath(tip.image)" class="align-self-start me-3 avatar-80 flex-shrink-0"
                            :alt="tip.title">
                        <div class="media-body">
                            <h5 class="mt-0">{{ tip.title }}</h5>
                            <p class="mb-0">{{ tip.description }}</p>
                        </div>
                    </div>
                </b-card-body>
            </b-card>
        </b-col>
        <b-col sm="12" class="mb-4">
            <Swiper class="ele-widget-swiper navigation-on-hover" :modules="[Navigation]" :loop="true" :breakpoints="{
                0: { slidesPerView: 1, },
                480: { slidesPerView: 2, },
                768: { slidesPerView: 3, },
                1023: { slidesPerView: 3, },
                1199: { slidesPerView: 4, },
            }" :space-between="24" :navigation="{ prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' }"
                :centered-slides="false" :autoplay="false">
                <swiper-slide v-for="(country, index) in countrieSlider" :key="index">
                    <b-card no-body class="card-block card-stretch card-height mb-0">
                        <div class="card-body">
                            <img class="arrow-img w-auto mb-3"
                                :src="generateImgPath(`/assets/images/small/${country.flag}`)" alt="iconflag" />
                            <h5 class="contact-number">
                                <i aria-hidden="true" class="ion ion-android-call"></i>
                                {{ country.phone }}
                            </h5>
                            <p class="mb-0">Help line {{ country.name }}</p>
                        </div>
                    </b-card>
                </swiper-slide>
                <div class="iqonic-navigation-custom iq-navi navigation-center">
                    <div class="iqonic-navigation d-flex" id="navDemo3">
                        <div class="swiper-buttons swiper-button-prev" tabindex="0" role="button"
                            aria-label="Previous slide">
                            <i class="ri-arrow-left-s-line"></i>
                        </div>
                        <div class="swiper-buttons swiper-button-next" tabindex="-1" role="button"
                            aria-label="Next slide">
                            <i class="ri-arrow-right-s-line"></i>
                        </div>
                    </div>
                </div>
            </Swiper>
        </b-col>
        <b-col sm="12" class="mt-2">
            <Swiper class="ele-widget-swiper dasb-cust-swiper" :modules="[Navigation]" :loop="true" :breakpoints="{
                0: { slidesPerView: 1, },
                480: { slidesPerView: 2, },
                768: { slidesPerView: 2, },
                1023: { slidesPerView: 3, },
                1199: { slidesPerView: 3, },
            }" :space-between="24" :navigation="{ prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' }"
                :centered-slides="false" :autoplay="false" :speed="1000">
                <swiper-slide v-for="(blog, index) in blogs" :key="index">
                    <div class="card card-block card-stretch card-height">
                        <div class="image-block">
                            <img :src="generateImgPath(`/assets/images/page-img/${blog.image}`)" class="img-fluid w-100"
                                alt="blog-img" />
                        </div>
                        <div class="card-body">
                            <div class="blog-description">
                                <div class="blog-meta">
                                    <a href="#">{{ blog.date }}</a>
                                </div>
                                <h4 class="mb-2">{{ blog.title }}</h4>
                                <p>{{ blog.description }}</p>
                                <a href="#">Read More <i class="ri-arrow-right-s-line"></i></a>
                            </div>
                        </div>
                    </div>
                </swiper-slide>
                <div class="iqonic-navigation-custom navigation-center">
                    <div class="iqonic-navigation" id="navDemo2">
                        <div class="swiper-buttons swiper-button-prev" tabindex="0" role="button"
                            aria-label="Previous slide">
                            <i class="ri-arrow-left-s-line"></i>
                        </div>
                        <div class="swiper-buttons swiper-button-next" tabindex="-1" role="button"
                            aria-label="Next slide">
                            <i class="ri-arrow-right-s-line"></i>
                        </div>
                    </div>
                </div>
            </Swiper>
        </b-col>
    </b-row>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper';

const generateImgPath = (path) => {
    return window.origin + import.meta.env.BASE_URL + path;
};

onMounted(() => {
    am4core.ready(function () {
        am4core.useTheme(am4themes_animated);

        // Create map instance
        let chart = am4core.create("world-map", am4maps.MapChart);

        // Set map definition
        chart.geodata = am4geodata_worldLow;
        chart.logo.disabled = true;

        // Set projection
        chart.projection = new am4maps.projections.Miller();

        // Create map polygon series
        let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

        // Exclude Antarctica
        polygonSeries.exclude = ["AQ"];

        // Make map load polygon (like country names) data from GeoJSON
        polygonSeries.useGeodata = true;

        // Configure series
        let polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.tooltipText = "{name}";
        polygonTemplate.fill = chart.colors.getIndex(0).lighten(0.5);

        // Create hover state and set alternative fill color
        let hs = polygonTemplate.states.create("hover");
        hs.properties.fill = chart.colors.getIndex(0);

        // Add image series
        let imageSeries = chart.series.push(new am4maps.MapImageSeries());
        imageSeries.mapImages.template.propertyFields.longitude = "longitude";
        imageSeries.mapImages.template.propertyFields.latitude = "latitude";

        // Image series data
        imageSeries.data = [
            { title: "Brussels", latitude: 50.8371, longitude: 4.3676 },
            { title: "Copenhagen", latitude: 55.6763, longitude: 12.5681 },
            { title: "Paris", latitude: 48.8567, longitude: 2.351 },
            { title: "Reykjavik", latitude: 64.1353, longitude: -21.8952 },
            { title: "Moscow", latitude: 55.7558, longitude: 37.6176 },
            { title: "Madrid", latitude: 40.4167, longitude: -3.7033 },
            { title: "London", latitude: 51.5002, longitude: -0.1262, url: "http://www.google.co.uk" },
            { title: "Peking", latitude: 39.9056, longitude: 116.3958 },
            { title: "New Delhi", latitude: 28.6353, longitude: 77.225 },
            { title: "Tokyo", latitude: 35.6785, longitude: 139.6823, url: "http://www.google.co.jp" },
            { title: "Ankara", latitude: 39.9439, longitude: 32.856 },
            { title: "Buenos Aires", latitude: -34.6118, longitude: -58.4173 },
            { title: "Brasilia", latitude: -15.7801, longitude: -47.9292 },
            { title: "Ottawa", latitude: 45.4235, longitude: -75.6979 },
            { title: "Washington", latitude: 38.8921, longitude: -77.0241 },
            { title: "Kinshasa", latitude: -4.3369, longitude: 15.3271 },
            { title: "Cairo", latitude: 30.0571, longitude: 31.2272 },
            { title: "Pretoria", latitude: -25.7463, longitude: 28.1876 }
        ];

        // Update markers when map position changes
        chart.events.on("ready", updateCustomMarkers);
        chart.events.on("mappositionchanged", updateCustomMarkers);

        function updateCustomMarkers() {
            imageSeries.mapImages.each((image) => {
                if (!image.dummyData || !image.dummyData.externalElement) {
                    image.dummyData = {
                        externalElement: createCustomMarker(image),
                    };
                }

                let xy = chart.geoPointToSVG({
                    longitude: image.longitude,
                    latitude: image.latitude,
                });
                image.dummyData.externalElement.style.top = `${xy.y}px`;
                image.dummyData.externalElement.style.left = `${xy.x}px`;
            });
        }

        function createCustomMarker(image) {
            let holder = document.createElement("div");
            holder.className = "map-marker";
            holder.title = image.dataItem.dataContext.title;
            holder.style.position = "absolute";

            if (image.url) {
                holder.onclick = () => (window.location.href = image.url);
                holder.className += " map-clickable";
            }

            let dot = document.createElement("div");
            dot.className = "dot";
            holder.appendChild(dot);

            let pulse = document.createElement("div");
            pulse.className = "pulse";
            holder.appendChild(pulse);

            chart.svgContainer.htmlElement.appendChild(holder);
            return holder;
        }
    });
});

const countries = ref([
    { name: 'China', flag: 'china.png', confirm: '80,967', recover: '972', death: '3,248' },
    { name: 'France', flag: 'france.png', confirm: '10,995', recover: '245', death: '372' },
    { name: 'Germany', flag: 'germany.png', confirm: '15,320', recover: '242', death: '44' },
    { name: 'Iran', flag: 'iran.png', confirm: '18,407', recover: '520', death: '1,284' },
    { name: 'Italy', flag: 'italy.png', confirm: '41,035', recover: '10,600', death: '3,405' },
    { name: 'Netherlands', flag: 'netherlands.png', confirm: '2,460', recover: '24', death: '76' },
    { name: 'Norway', flag: 'norway.png', confirm: '789', recover: '135', death: '35' },
    { name: 'South Korea', flag: 'south-koria.png', confirm: '1,200', recover: '500', death: '600' },
    { name: 'Spain', flag: 'spain.png', confirm: '18,077', recover: '150', death: '831' },
    { name: 'Sweden', flag: 'sweden.png', confirm: '800', recover: '250', death: '25' },
    { name: 'Switzerland', flag: 'switzerlands.png', confirm: '4,222', recover: '125', death: '43' },
    { name: 'United States', flag: 'usa.png', confirm: '14,354', recover: '150', death: '277' },
    { name: 'India', flag: 'india.png', confirm: '197', recover: '50', death: '4' },
]);

const healthTips = ref([
    { image: '/assets/images/page-img/45.png', title: 'Wash your hands frequently', description: 'Regularly and thoroughly clean your hands with an alcohol-based hand rub or wash them with soap and water.' },
    { image: '/assets/images/page-img/46.png', title: 'Maintain social distancing', description: 'Maintain at least 1 metre (3 feet) distance between yourself and anyone who is coughing or sneezing.' },
    { image: '/assets/images/page-img/47.png', title: 'Avoid touching eyes, nose and mouth', description: 'Hands touch many surfaces and can pick up viruses. Once contaminated, hands can transfer the virus to your eyes, nose or mouth. From there, the virus can enter your body and can make you sick.' },
    { image: '/assets/images/page-img/48.png', title: 'Practice respiratory hygiene', description: 'Make sure you, and the people around you, follow good respiratory hygiene. This means covering your mouth and nose with your bent elbow or tissue when you cough or sneeze. Then dispose of the used tissue immediately.', marginBottom: false },
]);

const countrieSlider = ref([
    { name: 'China', flag: 'china.png', phone: '+ 1 800 324 2323' },
    { name: 'France', flag: 'france.png', phone: '+ 1 800 324 2323' },
    { name: 'Germany', flag: 'germany.png', phone: '+ 1 800 324 2323' },
    { name: 'Iran', flag: 'iran.png', phone: '+ 1 800 324 2323' },
    { name: 'Italy', flag: 'italy.png', phone: '+ 1 800 324 2323' },
    { name: 'Netherlands', flag: 'netherlands.png', phone: '+ 1 800 324 2323' },
    { name: 'Norway', flag: 'norway.png', phone: '+ 1 800 324 2323' },
    { name: 'South Korea', flag: 'south-koria.png', phone: '+ 1 800 324 2323' },
    { name: 'Spain', flag: 'spain.png', phone: '+ 1 800 324 2323' },
    { name: 'Sweden', flag: 'sweden.png', phone: '+ 1 800 324 2323' },
    { name: 'Switzerland', flag: 'switzerlands.png', phone: '+ 1 800 324 2323' },
    { name: 'United States', flag: 'usa.png', phone: '+ 1 800 324 2323' },
    { name: 'India', flag: 'india.png', phone: '+ 1 800 324 2323' },
]);

const blogs = ref([
    {
        date: 'March 21, 2020',
        title: 'Containing coronavirus spread comes',
        description: `In the blog post, the IMF experts observed, "Success in containing the virus comes at the price of slowing economic activity, no matter whether social distancing and reduced mobility are voluntary or enforced."`,
        image: '40.png',
    },
    {
        date: 'March 21, 2020',
        title: 'Latest coronavirus updates',
        description: `ABC Action News is committed to providing Tampa Bay area residents all of the updates on the coronavirus, COVID-19, and the impact it's having on our way of life. To help you stay on top of it all, we'll be updating this daily blog as we continue to get through this together.`,
        image: '41.png',
    },
    {
        date: 'March 21, 2020',
        title: 'False Hope about Coronavirus',
        description: `While patients can and do recover from coronavirus infections, there are currently no approved treatments that are known to work against COVID-19. He said at his press briefing yesterday, that two drugs, hydroxychloroquine and remdesivir.`,
        image: '42.png',
    },
    {
        date: 'March 21, 2020',
        title: 'Coronavirus in Maine Blog',
        description: `This now includes cases formerly identified as presumptive positive. This classification applies to samples sent by a health provider directly to HETL that test positive and to samples from non-governmental labs for which HETL validates positive results.`,
        image: '43.png',
    },
]);
</script>