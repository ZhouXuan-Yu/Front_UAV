<script setup lang="ts">
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  interest: 'general'
});

const interests = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'path-planning', label: 'Path Planning' },
  { value: 'person-recognition', label: 'Person Recognition' },
  { value: 'vehicle-monitoring', label: 'Vehicle Monitoring' },
  { value: 'disaster-detection', label: 'Disaster Detection' },
  { value: 'license-plate', label: 'License Plate Recognition' },
  { value: 'data-dashboard', label: 'Data Dashboard' },
  { value: 'knowledge-graph', label: 'Knowledge Graph' }
];

const loading = ref(false);
const success = ref(false);
const error = ref(false);

const submitForm = () => {
  loading.value = true;
  error.value = false;

  // Simulate API call
  setTimeout(() => {
    loading.value = false;
    success.value = true;

    // Reset form
    form.value = {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      interest: 'general'
    };
  }, 1500);
};
</script>

<template>
  <div>
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <h1
          class="text-4xl md:text-5xl font-bold text-center mb-4"
          data-aos="fade-up"
        >
          Contact Us
        </h1>

        <p
          class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Get in touch with our team to learn more about our drone solutions for your specific needs.
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div
            class="bg-white rounded-lg shadow-lg p-8"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <h2 class="text-2xl font-bold mb-6">Send us a message</h2>

            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"
                  >
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"
                  >
                </div>

                <div>
                  <label for="company" class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    id="company"
                    v-model="form.company"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"
                  >
                </div>
              </div>

              <div>
                <label for="interest" class="block text-sm font-medium text-gray-700 mb-1">I'm interested in</label>
                <select
                  id="interest"
                  v-model="form.interest"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"
                >
                  <option
                    v-for="option in interests"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="4"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-skydio-blue focus:border-skydio-blue"
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  class="btn btn-primary w-full flex justify-center items-center"
                  :disabled="loading"
                >
                  <svg
                    v-if="loading"
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ loading ? 'Sending...' : 'Send Message' }}
                </button>
              </div>

              <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Thank you for your message! We'll get back to you as soon as possible.
              </div>

              <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                There was an error sending your message. Please try again.
              </div>
            </form>
          </div>

          <div data-aos="fade-up" data-aos-delay="300">
            <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 class="text-2xl font-bold mb-6">Contact Information</h2>

              <div class="space-y-4">
                <div class="flex items-start">
                  <svg class="w-6 h-6 text-skydio-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <div>
                    <p class="font-medium">Headquarters</p>
                    <p class="text-gray-600">3000 Clearview Way, San Mateo, CA 94402</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <svg class="w-6 h-6 text-skydio-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <p class="font-medium">Email</p>
                    <p class="text-gray-600">info@skydio-clone.com</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <svg class="w-6 h-6 text-skydio-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <div>
                    <p class="font-medium">Phone</p>
                    <p class="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-lg overflow-hidden shadow-lg h-64 bg-gray-300">
              <!-- Placeholder for a map -->
              <img
                src="https://cdn.sanity.io/images/mgxz50fq/~production-v3/b05a19afaed85c6b8145dc929d1df8aed06ee414-1158x585.png?w=3000&fit=max&auto=format"
                alt="Map"
                class="w-full h-full object-cover"
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
