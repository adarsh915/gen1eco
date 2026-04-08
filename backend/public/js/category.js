function loadCategories() {
  // Destroy existing DataTable instance before reinitializing
  if ($.fn.DataTable.isDataTable('#categoryTable')) {
    $('#categoryTable').DataTable().destroy();
  }

  $.get('/category/all', function(res) {
    if (!res.success) return;

    var html = '';
    res.data.forEach(function(row, i) {
      var status = row.status == 1
        ? '<span class="bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm">Active</span>'
        : '<span class="bg-danger-focus text-danger-main px-24 py-4 rounded-pill fw-medium text-sm">Inactive</span>';

      var imgHtml = row.image 
        ? '<img src="/uploads/categories/' + row.image + '" alt="' + row.name + '" class="rounded" style="width: 40px; height: 40px; object-fit: cover;" />'
        : '<span class="text-muted text-sm">No Image</span>';

      html += '<tr>'
        + '<td>' + (i + 1) + '</td>'
        + '<td>' + imgHtml + '</td>'
        + '<td>' + row.name + '</td>'
        + '<td>' + row.slug + '</td>'
        + '<td>' + status + '</td>'
        + '<td>' + new Date(row.created_at).toLocaleDateString() + '</td>'
        + '<td>'
        + '<button class="w-32-px h-32-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center edit-btn"'
        + ' data-id="' + row.id + '" data-name="' + row.name + '" data-status="' + row.status + '" data-image="' + (row.image || '') + '">'
        + '<iconify-icon icon="lucide:edit"></iconify-icon></button> '
        + '<button class="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center delete-btn"'
        + ' data-id="' + row.id + '" data-name="' + row.name + '">'
        + '<iconify-icon icon="mingcute:delete-2-line"></iconify-icon></button>'
        + '</td></tr>';
    });

    $('#categoryTableBody').html(
      html || '<tr><td colspan="6" class="text-center">No categories found</td></tr>'
    );

    // ✅ Initialize DataTable AFTER rows are injected
    $('#categoryTable').DataTable({
      pageLength: 10,
      order: [],
      columnDefs: [
        { orderable: false, targets: [1, 4, 6] } // Disable sort on Image, Status & Action columns
      ]
    });
  });
}

$(document).ready(function () {
  if ($('#categoryTableBody').length === 0) return;

  loadCategories();

  // ── ADD ──────────────────────────────────────────────
  $('#saveBtn').on('click', function () {
    var name = $('#add_name').val().trim();
    if (!name) return showToast('Name is required', 'danger');

    var formData = new FormData();
    formData.append('name', name);
    formData.append('status', $('#add_status').val());
    if ($('#add_image')[0].files[0]) {
      formData.append('image', $('#add_image')[0].files[0]);
    }

    $.ajax({
      url: '/category/create',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (res) {
        if (res.success) {
          $('#addModal').modal('hide');
          $('#add_name').val('');
          $('#add_status').val('1');
          $('#add_image').val('');
          loadCategories();
          showToast(res.message, 'success');
        } else {
          showToast(res.message, 'danger');
        }
      },
      error: function (xhr) { showToast('Server error: ' + xhr.status, 'danger'); }
    });
  });

  // ── EDIT ─────────────────────────────────────────────
  $(document).on('click', '.edit-btn', function () {
    $('#edit_id').val($(this).data('id'));
    $('#edit_name').val($(this).data('name'));
    $('#edit_status').val($(this).data('status'));
    $('#edit_image').val('');
    
    var img = $(this).data('image');
    if (img) {
      $('#edit_image_preview').attr('src', '/uploads/categories/' + img).show();
    } else {
      $('#edit_image_preview').hide();
    }
    
    $('#editModal').modal('show');
  });

  $('#updateBtn').on('click', function () {
    var name = $('#edit_name').val().trim();
    if (!name) return showToast('Name is required', 'danger');

    var formData = new FormData();
    formData.append('id', $('#edit_id').val());
    formData.append('name', name);
    formData.append('status', $('#edit_status').val());
    if ($('#edit_image')[0].files[0]) {
      formData.append('image', $('#edit_image')[0].files[0]);
    }

    $.ajax({
      url: '/category/update',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (res) {
        if (res.success) {
          $('#editModal').modal('hide');
          loadCategories();
          showToast(res.message, 'success');
        } else {
          showToast(res.message, 'danger');
        }
      },
      error: function (xhr) { showToast('Server error: ' + xhr.status, 'danger'); }
    });
  });

  // ── DELETE ───────────────────────────────────────────
  $(document).on('click', '.delete-btn', function () {
    $('#delete_id').val($(this).data('id'));
    $('#delete_name').text($(this).data('name'));
    $('#deleteModal').modal('show');
  });

  $('#confirmDeleteBtn').on('click', function () {
    $.ajax({
      url: '/category/delete/' + $('#delete_id').val(),
      type: 'DELETE',
      success: function (res) {
        if (res.success) {
          $('#deleteModal').modal('hide');
          loadCategories();
          showToast(res.message, 'success');
        } else {
          showToast(res.message, 'danger');
        }
      },
      error: function (xhr) { showToast('Server error: ' + xhr.status, 'danger'); }
    });
  });
});

// ── TOAST ─────────────────────────────────────────────
function showToast(message, type) {
  var id = 'toast_' + Date.now();
  $('body').append(
    '<div class="position-fixed top-0 end-0 p-3" style="z-index:9999" id="' + id + '">'
    + '<div class="toast show align-items-center text-bg-' + type + ' border-0">'
    + '<div class="d-flex"><div class="toast-body">' + message + '</div>'
    + '<button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="$(\'#' + id + '\').remove()"></button>'
    + '</div></div></div>'
  );
  setTimeout(function () { $('#' + id).remove(); }, 3000);
}