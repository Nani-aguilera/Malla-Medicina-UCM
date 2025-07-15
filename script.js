document.addEventListener('DOMContentLoaded', () => {
    const courses = document.querySelectorAll('.course');
    let approvedCourses = new Set(JSON.parse(localStorage.getItem('approvedCourses')) || []);

    // Función para actualizar el estado visual de todos los cursos
    function updateCourseStates() {
        courses.forEach(course => {
            const courseId = course.dataset.id;
            const prerequisites = course.dataset.prerequisites ? course.dataset.prerequisites.split(',') : [];

            // 1. Resetear clases de estado
            course.classList.remove('approved', 'prereq-pending', 'can-take');

            // 2. Aplicar clase 'approved' si está en la lista de aprobados
            if (approvedCourses.has(courseId)) {
                course.classList.add('approved');
            } else {
                // 3. Evaluar prerrequisitos si no está aprobado
                const hasAllPrerequisites = prerequisites.every(prereqId => approvedCourses.has(prereqId));

                if (prerequisites.length > 0 && !hasAllPrerequisites) {
                    course.classList.add('prereq-pending');
                } else if (hasAllPrerequisites) {
                    course.classList.add('can-take');
                }
            }
        });
    }

    // Cargar el estado inicial al cargar la página
    updateCourseStates();

    // Añadir el evento de clic a cada curso
    courses.forEach(course => {
        course.addEventListener('click', () => {
            const courseId = course.dataset.id;
            const isApproved = approvedCourses.has(courseId);
            const prerequisites = course.dataset.prerequisites ? course.dataset.prerequisites.split(',') : [];
            const hasAllPrerequisites = prerequisites.every(prereqId => approvedCourses.has(prereqId));

            // Si ya está aprobado, desaprobarlo
            if (isApproved) {
                // Verificar si este curso es prerrequisito de algún curso ya aprobado.
                // Si lo es, no permitir desaprobarlo para evitar inconsistencias.
                let canDisapprove = true;
                courses.forEach(c => {
                    if (approvedCourses.has(c.dataset.id) && c.dataset.prerequisites.includes(courseId)) {
                        canDisapprove = false;
                    }
                });

                if (canDisapprove) {
                    approvedCourses.delete(courseId);
                } else {
                    alert(`No puedes desaprobar "${course.dataset.name}" porque es prerrequisito de un curso que ya tienes aprobado.`);
                    return; // Salir de la función sin cambiar el estado
                }

            } else {
                // Si no está aprobado, intentar aprobarlo
                if (prerequisites.length === 0 || hasAllPrerequisites) {
                    approvedCourses.add(courseId);
                } else {
                    const missingPrereqs = prerequisites.filter(prereqId => !approvedCourses.has(prereqId));
                    const missingPrereqNames = missingPrereqs.map(id => document.querySelector(`.course[data-id="${id}"]`).dataset.name);
                    alert(`No puedes aprobar "${course.dataset.name}" aún. Debes aprobar primero: ${missingPrereqNames.join(', ')}.`);
                    return; // Salir de la función sin cambiar el estado
                }
            }

            localStorage.setItem('approvedCourses', JSON.stringify(Array.from(approvedCourses)));
            updateCourseStates(); // Actualizar el estado de todos los cursos después del cambio
        });
    });
});
