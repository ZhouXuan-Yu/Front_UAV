<script setup lang="ts">
import { ref } from 'vue';

const partners = ref([
  { id: 1, image: 'https://ext.same-assets.com/913537297/1124492884.jpeg', alt: 'New York Police Department' },
  { id: 2, image: 'https://ext.same-assets.com/913537297/2962017561.jpeg', alt: 'Oklahoma City Police Dept' },
  { id: 3, image: 'https://ext.same-assets.com/913537297/2419577417.png', alt: 'CalTrans' },
  { id: 4, image: 'https://ext.same-assets.com/913537297/145035404.jpeg', alt: 'Partner logo' }
]);

const footerLinks = ref({
  products: [
    { name: 'X10', url: '#' },
    { name: 'X10D', url: '#' }, 
    { name: 'Dock', url: '#' },
    { name: 'Software', url: '#' }
  ],
  solutions: [
    { name: 'Path Planning', url: '/path-planning' },
    { name: 'Person Recognition', url: '/person-recognition' },
    { name: 'Vehicle Monitoring', url: '/vehicle-monitoring' },
    { name: 'All solutions', url: '#' }
  ],
  resources: [
    { name: 'Resources', url: '#' },
    { name: 'Data Dashboard', url: '/data-dashboard' },
    { name: 'Knowledge Graph', url: '/knowledge-graph' },
    { name: 'Resellers', url: '#' }
  ],
  company: [
    { name: 'About', url: '#' },
    { name: 'Blog', url: '#' },
    { name: 'Careers', url: '#' },
    { name: 'Security Center', url: '#' }
  ]
});

const supportLinks = ref([
  { name: 'Support Center', url: '#' },
  { name: 'Training', url: '#' }
]);

const shopLinks = ref([
  { name: 'Brand Merch Store', url: '#' },
  { name: 'S2+ Accessories', url: '#' }
]);

const socialLinks = ref([
  { name: 'LinkedIn', icon: 'linkedin', url: '#' },
  { name: 'Facebook', icon: 'facebook', url: '#' },
  { name: 'Twitter', icon: 'twitter', url: '#' },
  { name: 'YouTube', icon: 'youtube', url: '#' },
  { name: 'Instagram', icon: 'instagram', url: '#' }
]);
</script>

<template>
  <section class="bg-skydio-dark text-white">
    <!-- Partners Section -->
    <div class="py-16 border-b border-white/10">
      <div
        class="container mx-auto px-4 text-center"
        data-aos="fade-up"
      >
        <h2 class="text-3xl md:text-4xl font-bold mb-10">
          Industry leaders fly Skydio.<br>
          Let's build your drone program today.
        </h2>

        <div class="flex flex-wrap justify-center items-center gap-8 mb-10">
          <div 
            v-for="partner in partners" 
            :key="partner.id"
            class="partner-logo-container"
          >
            <img
              :src="partner.image"
              :alt="partner.alt"
              class="h-16 w-auto object-contain rounded transition-all hover:brightness-110"
            >
          </div>
        </div>

        <router-link
          to="#"
          class="btn btn-primary inline-block text-lg px-8 py-3"
        >
          Get started
        </router-link>
      </div>
    </div>
    
    <!-- Footer Section -->
    <footer class="py-12">
      <div class="container mx-auto px-4">
        <!-- Main Footer Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <!-- Logo and Newsletter -->
          <div class="lg:col-span-1">
            <router-link to="/" class="inline-block mb-6">
              <div class="text-white font-bold text-xl">Skydio</div>
            </router-link>
            
            <p class="text-sm text-white/80 mb-4">Get our latest news:</p>
            
            <div class="flex">
              <input 
                type="email" 
                placeholder="Email" 
                class="bg-white/10 rounded-l px-4 py-2 text-white placeholder-white/50 w-full focus:outline-none focus:ring-1 focus:ring-skydio-blue"
              >
              <button class="bg-skydio-blue text-white px-4 py-2 rounded-r hover:bg-opacity-90 transition-colors duration-300">
                Submit
              </button>
            </div>
          </div>
          
          <!-- Footer Links -->
          <div>
            <h3 class="text-lg font-bold mb-4">Products</h3>
            <ul class="space-y-2">
              <li v-for="link in footerLinks.products" :key="link.name">
                <router-link :to="link.url" class="text-white/70 hover:text-white transition-colors duration-300">
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-bold mb-4">Solutions</h3>
            <ul class="space-y-2">
              <li v-for="link in footerLinks.solutions" :key="link.name">
                <router-link :to="link.url" class="text-white/70 hover:text-white transition-colors duration-300">
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-bold mb-4">Resources</h3>
            <ul class="space-y-2">
              <li v-for="link in footerLinks.resources" :key="link.name">
                <router-link :to="link.url" class="text-white/70 hover:text-white transition-colors duration-300">
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-bold mb-4">Company</h3>
            <ul class="space-y-2">
              <li v-for="link in footerLinks.company" :key="link.name">
                <router-link :to="link.url" class="text-white/70 hover:text-white transition-colors duration-300">
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Secondary Links -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div>
            <h3 class="text-lg font-bold mb-4">Support & Training</h3>
            <ul class="space-y-2">
              <li v-for="link in supportLinks" :key="link.name">
                <router-link :to="link.url" class="text-white/70 hover:text-white transition-colors duration-300">
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-bold mb-4">Shop</h3>
            <ul class="space-y-2">
              <li v-for="link in shopLinks" :key="link.name">
                <router-link :to="link.url" class="text-white/70 hover:text-white transition-colors duration-300">
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Footer Bottom -->
        <div class="pt-8 border-t border-white/10">
          <p class="text-center text-white/60 mb-4">
            Proudly designed, assembled, and supported in the USA
          </p>
          
          <div class="flex justify-center space-x-6 mb-6">
            <a v-for="link in socialLinks" :key="link.name" :href="link.url" class="text-white/70 hover:text-white transition-colors duration-300" :aria-label="link.name">
              <span class="sr-only">{{ link.name }}</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path v-if="link.icon === 'linkedin'" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                <path v-if="link.icon === 'facebook'" d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                <path v-if="link.icon === 'twitter'" d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                <path v-if="link.icon === 'youtube'" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                <path v-if="link.icon === 'instagram'" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
          
          <p class="text-sm text-white/60 text-center">
            © {{ new Date().getFullYear() }} Skydio, Inc. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.partner-logo-container {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.partner-logo-container:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}
</style>
