<script setup>
const slug = ref('');

const deleteFile = async () => {
  try {
    const response = await fetch(`/api/files/${slug.value}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    alert(result.message); // Informacja o wyniku operacji
  } catch (error) {
    console.error('Failed to delete file:', error);
    alert('Failed to delete file.');
  }
};
</script>

<template>
  <div>
    <label for="slug">Slug pliku do usuniecia:</label>
    <input
      id="slug"
      type="text"
      v-model="slug"
    />
    <button @click="deleteFile()">Usuń plik</button>
  </div>
</template>
