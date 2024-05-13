<template>
  <div>
    <h1>Edit File</h1>
    <form @submit.prevent="handleSubmit">
      <label for="title">Slug:</label>
      <input
        id="title"
        type="text"
        v-model="title"
      />

      <label for="newTitle">New Title:</label>
      <input
        id="newTitle"
        type="text"
        v-model="newTitle"
      />

      <label for="file">File:</label>
      <input
        id="file"
        type="file"
        @change="handleFileChange"
      />

      <div>
        <h3>Badges</h3>
        <label for="label1">Label:</label>
        <input
          id="label1"
          type="text"
          v-model="badges[0].label"
        />

        <label for="color1">Color:</label>
        <input
          id="color1"
          type="text"
          v-model="badges[0].color"
        />

        <label for="label2">Label:</label>
        <input
          id="label2"
          type="text"
          v-model="badges[1].label"
        />

        <label for="color2">Color:</label>
        <input
          id="color2"
          type="text"
          v-model="badges[1].color"
        />
      </div>

      <button type="submit">Update File</button>
    </form>
  </div>
</template>

<script setup>
const title = ref('');
const newTitle = ref('');
const selectedFile = ref(null);

const badges = ref([
  { label: 'Cooking', color: 'lime' },
  { label: 'Asia', color: 'red' },
]);

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const handleSubmit = async () => {
  if (!selectedFile.value) {
    alert('Please select a file first.');
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('title', newTitle.value);
  formData.append('badges', JSON.stringify(badges.value));

  try {
    const response = await fetch(`/api/files/${title.value}`, {
      method: 'PUT',
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      alert('File updated successfully.');
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error updating the file:', error);
    alert('Error updating the file.');
  }
};
</script>
