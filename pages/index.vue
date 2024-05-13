<script setup>
import { ref } from 'vue';

const selectedFile = ref(null);
const title = ref(''); // ref for the title input

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!selectedFile.value) {
    alert('Please select a file first.');
    return;
  }
  const badges = [
    { label: 'Cooking', color: 'lime' },
    { label: 'Asia', color: 'red' },
  ];

  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('title', title.value);
  formData.append('badges', JSON.stringify(badges));
  console.log(JSON.stringify(badges));

  try {
    const response = await fetch(`/api/files/${selectedFile.value.name}`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    alert(result.message);
  } catch (error) {
    console.error('Failed to upload the file:', error);
    alert('Failed to upload the file.');
  }
};
</script>

<template>
  <div>
    <input
      type="file"
      @change="handleFileChange"
    />
    <input v-model="title" />
    <button @click="uploadFile">Upload File</button>
  </div>
</template>
