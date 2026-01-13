
/**
 * Função para eliminar itens com confirmação
 * Utilizada em todas as listagens (clientes, barbeiros, serviços, reservas)
 */
function deleteItem(url, message) {
    if (confirm(message || 'Tem certeza que deseja eliminar este item?')) {
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message || 'Item eliminado com sucesso!');
                window.location.reload();
            } else {
                alert(data.message || 'Erro ao eliminar item');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar a solicitação');
        });
    }
}

/**
 * Preview de imagem ao selecionar ficheiro
 * Útil para o upload de fotos de barbeiros
 */
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const preview = document.getElementById('image-preview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Validação de formulários no cliente
 */
document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alerts após 5 segundos
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
});