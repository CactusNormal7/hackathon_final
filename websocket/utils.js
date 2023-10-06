function generateUniqueRandomNumbers(count, min, max) {
    if (count > (max - min + 1)) {
      throw new Error("Impossible de générer autant de nombres uniques dans l'intervalle spécifié.");
    }
  
    const uniqueNumbers = new Set();
  
    while (uniqueNumbers.size < count) {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      uniqueNumbers.add(randomNumber);
    }
  
    return Array.from(uniqueNumbers);
  }

module.exports = {
    generateUniqueRandomNumbers
}