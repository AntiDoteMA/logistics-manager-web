# 🤖 AI WORKER MAIN INSTRUCTION GUIDE

## 📋 OVERVIEW

This document serves as the **PRIMARY INSTRUCTION GUIDE** for AI Workers operating on this Flask logistics management web application. It explains the AI documentation system, file structure, workflow priorities, and MCP integration requirements.

---

## 🚨 **CRITICAL FIRST STEP: READ `.inprocess.ai.md` FILES FIRST**

**⚠️ MANDATORY WORKFLOW:**
1. **ALWAYS start by reading any `*.inprocess.ai.md` files in the project root**
2. These files contain the **MOST CURRENT** instructions and project state
3. `.inprocess.ai.md` files **SUPERSEDE ALL OTHER DOCUMENTATION**
4. Currently active: `AI-Instructions.inprocess.ai.md`

---

## 📁 AI DOCUMENTATION SYSTEM (`.ai.md` FILE EXTENSIONS)

### 🔄 **File Type Classification**

#### **1. `.inprocess.ai.md` - ACTIVE INSTRUCTIONS** 
- **Priority:** 🔴 **HIGHEST** - Read FIRST, always
- **Purpose:** Current active development instructions
- **Current File:** `AI-Instructions.inprocess.ai.md`
- **Contains:** 
  - Current project state and completion status
  - Modular architecture guidelines
  - Development patterns and best practices
  - Blueprint routing patterns
  - Testing and troubleshooting guides

#### **2. `*SUMMARY*.ai.md` - PROJECT STATE DOCUMENTATION**
- **Priority:** 🟡 **MEDIUM** - Reference for context
- **Files:**
  - `CURRENT_PROJECT_SUMMARY.ai.md` - Current modular architecture state
  - `PROJECT_FILE_SUMMARY.ai.md` - File structure and modularization details
- **Contains:**
  - Project structure before/after modularization
  - Complete file mapping and organization
  - Module status and completion tracking

#### **3. `*.old.ai.md` - ARCHIVED INSTRUCTIONS**
- **Priority:** 🟢 **LOW** - Historical reference only
- **Status:** **PRESENT** - Available for historical context
- **Purpose:** Previous instruction versions, migration details, and completed task summaries
- **Current Files:**
  - `MIGRATION_GUIDE.old.ai.md` - Migration from monolithic to modular architecture
  - `IMPLEMENTATION_SUMMARY.old.ai.md` - Module-by-module implementation details
  - `EXPENSES_COMPLETE.old.ai.md` - Expense module completion documentation
  - `EXPENSES_STATUS.old.ai.md` - Expense implementation status tracking

---

## 🎯 **PRIORITY READING ORDER**

### **Phase 1: Essential (MUST READ)**
1. 🔴 `AI-Instructions.inprocess.ai.md` - **CURRENT ACTIVE INSTRUCTIONS**
2. 🟡 `CURRENT_PROJECT_SUMMARY.ai.md` - Project architecture overview

### **Phase 2: Context (READ AS NEEDED)**
3. 🟡 `PROJECT_FILE_SUMMARY.ai.md` - Detailed file structure
4. 🟢 `for_LLM/` directory - UI/UX reference materials

### **Phase 3: Reference (OPTIONAL)**
5. 🟢 Any additional `.ai.md` files for specific context
6. 🟢 `*.old.ai.md` files for historical implementation details:
   - `MIGRATION_GUIDE.old.ai.md` - Architecture migration details
   - `IMPLEMENTATION_SUMMARY.old.ai.md` - Previous implementation status
   - `EXPENSES_COMPLETE.old.ai.md` - Expense module documentation
   - `EXPENSES_STATUS.old.ai.md` - Expense tracking history
7. 🟢 `Readme.md` - General project information

---

## 🏗️ **KEY FILES TO MONITOR**

### **Core Application Structure**
- `run.py` - Main entry point
- `app/__init__.py` - Application factory and blueprint registration
- `database.py` - Database configuration
- `requirements.txt` - Dependencies

### **Modular Architecture (ALL CURRENT)**
```
app/
├── auth/               # Authentication & user management
├── routes/             # Page routing blueprints
├── ajax/               # AJAX endpoints by module
├── services/           # Business logic layer
├── api/                # REST API endpoints
└── utils/              # Error handling & utilities
```

### **Frontend Assets (UNCHANGED)**
- `templates/` - Jinja2 HTML templates
- `static/` - CSS, JavaScript, images

---

## 🔧 **DEVELOPMENT PATTERNS & RULES**

### **Modular Architecture Requirements**
- ✅ **USE:** Modular Flask Blueprint structure
- ✅ **USE:** Service layer pattern (`app/services/`)
- ✅ **USE:** API layer pattern (`app/api/`)
- ✅ **USE:** Proper blueprint URL namespacing
- ❌ **AVOID:** Monolithic code in single files
- ❌ **AVOID:** Direct database operations in routes

### **Blueprint Routing Pattern**
```python
# Correct URL references in templates:
url_for('main.dashboard')      # Main routes
url_for('auth.login')          # Auth routes  
url_for('pages.invoices')      # Page routes
```

### **File Naming Conventions**
- Service files: `*_service.py`
- API files: `*_api.py`
- AJAX files: `*_ajax.py`
- Route files: `*_routes.py`

---

## 🛠️ **MCP INTEGRATION REQUIREMENTS**

### **Database Management (Neon MCP)**
When working with database operations, consider using:
- `mcp_neon_run_sql` - For SQL execution
- `mcp_neon_describe_table_schema` - For schema inspection
- `mcp_neon_prepare_database_migration` - For schema changes
- `mcp_neon_explain_sql_statement` - For query optimization

### **Development Workflow MCP Tools**
- Use appropriate MCP tools for:
  - Database schema inspection
  - SQL query testing and optimization
  - Migration management
  - Performance analysis

---

## 🧪 **TESTING & VERIFICATION CHECKLIST**

### **Application Startup**
1. ✅ Run `python run.py` successfully
2. ✅ Application starts on http://127.0.0.1:5000
3. ✅ No import or blueprint registration errors

### **Core Functionality**
1. ✅ Authentication system (login/logout)
2. ✅ Dashboard loads correctly
3. ✅ All business modules operational:
   - Operations Management
   - Invoice Management  
   - Client Management
   - Vendor Management
   - Bill Management
   - Expenses Management
   - Payments Management

### **Technical Verification**
1. ✅ All `url_for()` calls use correct blueprint namespace
2. ✅ AJAX endpoints respond correctly
3. ✅ Database operations work through service layer
4. ✅ Error handling functions properly

---

## 🚨 **COMMON ISSUES & TROUBLESHOOTING**

### **Blueprint Errors**
- **Error:** `BuildError: Could not build url for endpoint`
- **Solution:** Check all `url_for()` calls use blueprint prefix
- **Reference:** See `AI-Instructions.inprocess.ai.md` troubleshooting section

### **Import Errors**
- **Error:** Module import failures
- **Solution:** Verify modular import paths
- **Pattern:** Use `from app.services import *_service`

### **Template Issues**
- **Error:** Template not found or broken links
- **Solution:** Ensure template `url_for()` calls use correct blueprint names

---

## 📚 **REFERENCE MATERIALS**

### **Historical Documentation (`.old.ai.md` Files)**
- `MIGRATION_GUIDE.old.ai.md` - **Use for:** Understanding the modularization process, migration patterns, before/after architecture comparison
- `IMPLEMENTATION_SUMMARY.old.ai.md` - **Use for:** Previous module implementation strategies, completed task patterns, architecture decisions
- `EXPENSES_COMPLETE.old.ai.md` - **Use for:** Expense module specific implementation details and completion criteria
- `EXPENSES_STATUS.old.ai.md` - **Use for:** Expense module development timeline and status tracking

### **UI/UX Guidelines**
- `for_LLM/llms-full.txt` - Complete UI reference
- `for_LLM/llms.txt` - Condensed UI guidelines  
- `for_LLM/Markdown_accordion.md.txt` - Flowbite accordion patterns
- `for_LLM/Markdown_angular.md.txt` - Angular/Tailwind patterns

### **Legacy Reference**
- `my_py_app/` - Original PyQt5 application (reference only)
- `app.py` - Legacy monolithic Flask app (reference only)

---

## 🎯 **CURRENT PROJECT STATUS (as of June 23, 2025)**

### **✅ COMPLETED MODULES**
- ✅ Complete modular architecture implementation
- ✅ All 8 business modules mostly operational (some functionality and bugs still need work,refer to AI-Instructions.inprocess.ai.md)
   - Some functionality gaps to fill
   - Bugs that need to be fixed
   - Features that may need completion or refinement
- ✅ Service and API layer separation
- ✅ Blueprint routing system
- ✅ Authentication and user management
- ✅ Database integration and CRUD operations

### **📋 ACTIVE PRIORITIES**
- 🔄 Maintain modular architecture standards
- 🔄 Implement new features using established patterns
- 🔄 Optimize for production deployment
- 🔄 Add comprehensive API documentation

---

## 🚀 **AI WORKER ACTION PLAN**

### **On Every Task:**
1. 📖 **READ** `AI-Instructions.inprocess.ai.md` FIRST
2. 🔍 **VERIFY** current project state in summary files
3. 🏗️ **FOLLOW** modular architecture patterns
4. 🧪 **TEST** changes using established verification checklist
5. 📝 **UPDATE** documentation when making significant changes

### **For New Features:**
1. 📋 Plan within modular structure (`services/`, `api/`, `ajax/`)
2. 🔌 Register new blueprints in `app/__init__.py`
3. 🎨 Follow established naming conventions
4. 🔗 Use proper blueprint URL patterns
5. ✅ Implement comprehensive error handling

---

**🎯 Remember: This project has evolved from a monolithic structure to a fully modular, production-ready Flask application. All new work must respect and extend the established modular patterns outlined in the `.inprocess.ai.md` files.**
