// 个人博客主JavaScript文件

// 博客文章数据
const blogPosts = [];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化移动端菜单
    initMobileMenu();
    
    // 根据当前页面加载相应内容
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            loadPosts();
            initSearch();
            break;
        case 'articles':
            initArticlesPage();
            break;
        case 'tags':
            initTagsPage();
            break;
        case 'about':
            // 关于页面不需要特殊初始化
            break;
        case 'article':
            initArticlePage();
            break;
    }
});

// 获取当前页面
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    if (page === 'index.html' || page === '' || page === '/') {
        return 'index';
    } else if (page === 'articles.html') {
        return 'articles';
    } else if (page === 'tags.html') {
        return 'tags';
    } else if (page === 'about.html') {
        return 'about';
    } else if (page === 'article.html') {
        return 'article';
    }
    return 'index';
}

// 初始化移动端菜单
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // 点击菜单项关闭菜单
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // 点击菜单外部关闭菜单
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// 首页：加载文章
function loadPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    
    // 显示前6篇文章
    const postsToShow = blogPosts.slice(0, 6);
    
    postsContainer.innerHTML = postsToShow.map(post => createPostCard(post)).join('');
    
    // 加载更多功能
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        let currentCount = 6;
        
        loadMoreBtn.addEventListener('click', function() {
            const morePosts = blogPosts.slice(currentCount, currentCount + 3);
            if (morePosts.length > 0) {
                morePosts.forEach(post => {
                    postsContainer.innerHTML += createPostCard(post);
                });
                currentCount += 3;
                
                // 如果没有更多文章，隐藏按钮
                if (currentCount >= blogPosts.length) {
                    loadMoreBtn.style.display = 'none';
                }
            }
        });
    }
}

// 创建文章卡片
function createPostCard(post) {
    return `
        <article class="featured-card fade-in" data-id="${post.id}">
            <div class="featured-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                <div class="category-badge">${post.category}</div>
            </div>
            <div class="featured-content">
                <div class="meta-info">
                    <span class="date"><i class="far fa-calendar"></i> ${post.date}</span>
                    <span class="views"><i class="far fa-eye"></i> ${post.views}</span>
                    <span class="reading-time"><i class="far fa-clock"></i> ${post.readingTime}分钟阅读</span>
                </div>
                <h3 class="featured-title">${post.title}</h3>
                <p class="featured-excerpt">${post.excerpt}</p>
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="article.html?id=${post.id}" class="read-more">阅读全文 <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>
    `;
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// 执行搜索
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        alert('请输入搜索关键词');
        return;
    }
    
    // 过滤文章
    const results = blogPosts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query)) ||
        post.content.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        alert(`没有找到包含"${query}"的文章`);
        return;
    }
    
    // 跳转到文章列表页并显示搜索结果
    const searchParams = new URLSearchParams();
    searchParams.set('search', query);
    window.location.href = `articles.html?${searchParams.toString()}`;
}

// 文章列表页初始化
function initArticlesPage() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const category = urlParams.get('category') || 'all';
    const sort = urlParams.get('sort') || 'newest';
    
    // 加载文章
    loadArticles({
        search: searchQuery,
        category: category,
        sort: sort
    });
    
    // 初始化筛选功能
    initFilters();
    
    // 初始化视图切换
    initViewToggle();
    
    // 初始化分类点击
    initCategoryLinks();
}

// 加载文章列表
function loadArticles(filters = {}) {
    const container = document.getElementById('articles-container');
    const countElement = document.getElementById('articles-count');
    if (!container) return;
    
    // 过滤文章
    let filteredPosts = [...blogPosts];
    
    // 搜索过滤
    if (filters.search) {
        const query = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }
    
    // 类别过滤
    if (filters.category && filters.category !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === filters.category);
    }
    
    // 排序
    switch(filters.sort) {
        case 'newest':
            filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'popular':
            filteredPosts.sort((a, b) => b.views - a.views);
            break;
    }
    
    // 更新计数
    if (countElement) {
        countElement.textContent = `所有文章 (${filteredPosts.length}篇)`;
    }
    
    // 渲染文章
    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x"></i>
                <h3>没有找到符合条件的文章</h3>
                <p>尝试使用不同的关键词或筛选条件</p>
            </div>
        `;
    } else {
        container.innerHTML = filteredPosts.map(post => createArticleItem(post)).join('');
    }
    
    // 更新分页
    updatePagination(filteredPosts.length);
}

// 创建文章列表项
function createArticleItem(post) {
    return `
        <article class="article-item fade-in" data-id="${post.id}">
            <div class="article-item-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="article-item-content">
                <div class="article-item-meta">
                    <span class="category">${post.category}</span>
                    <span class="date">${post.date}</span>
                    <span class="views"><i class="far fa-eye"></i> ${post.views}</span>
                </div>
                <h3 class="article-item-title">
                    <a href="article.html?id=${post.id}">${post.title}</a>
                </h3>
                <p class="article-item-excerpt">${post.excerpt}</p>
                <div class="article-item-footer">
                    <div class="tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <a href="article.html?id=${post.id}" class="read-more">阅读全文 <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </article>
    `;
}

// 初始化筛选功能
function initFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            updateArticles();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            updateArticles();
        });
    }
}

// 初始化视图切换
function initViewToggle() {
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const container = document.getElementById('articles-container');
    
    if (gridViewBtn && listViewBtn && container) {
        gridViewBtn.addEventListener('click', function() {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            container.classList.remove('list-view');
            container.classList.add('grid-view');
        });
        
        listViewBtn.addEventListener('click', function() {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            container.classList.remove('grid-view');
            container.classList.add('list-view');
        });
    }
}

// 初始化分类链接
function initCategoryLinks() {
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            
            // 更新URL
            const urlParams = new URLSearchParams(window.location.search);
            if (category === 'all') {
                urlParams.delete('category');
            } else {
                urlParams.set('category', category);
            }
            
            // 重新加载文章
            loadArticles({
                category: category,
                sort: urlParams.get('sort') || 'newest'
            });
        });
    });
}

// 更新文章列表
function updateArticles() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    loadArticles({
        category: categoryFilter ? categoryFilter.value : 'all',
        sort: sortFilter ? sortFilter.value : 'newest'
    });
}

// 更新分页
function updatePagination(totalArticles) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const pageSize = 6;
    const totalPages = Math.ceil(totalArticles / pageSize);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<button class="page-btn"><i class="fas fa-chevron-left"></i></button>';
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="page-btn ${i === 1 ? 'active' : ''}">${i}</button>`;
    }
    
    paginationHTML += '<button class="page-btn"><i class="fas fa-chevron-right"></i></button>';
    pagination.innerHTML = paginationHTML;
    
    // 分页点击事件
    const pageBtns = pagination.querySelectorAll('.page-btn');
    pageBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            // 处理分页逻辑
            console.log(`跳转到第 ${index} 页`);
        });
    });
}

// 标签页面初始化
function initTagsPage() {
    // 生成标签数据
    const tagsData = generateTagsData();
    
    // 渲染标签云
    renderTagCloud(tagsData);
    
    // 渲染标签列表
    renderTagsList(tagsData);
    
    // 初始化标签搜索
    initTagSearch();
    
    // 初始化标签点击
    initTagClicks();
}

// 生成标签数据
function generateTagsData() {
    const tagsMap = {};
    
    blogPosts.forEach(post => {
        post.tags.forEach(tag => {
            if (!tagsMap[tag]) {
                tagsMap[tag] = {
                    name: tag,
                    count: 0,
                    articles: []
                };
            }
            tagsMap[tag].count++;
            tagsMap[tag].articles.push(post);
        });
    });
    
    return Object.values(tagsMap).sort((a, b) => b.count - a.count);
}

// 渲染标签云
function renderTagCloud(tagsData) {
    const tagCloud = document.getElementById('tag-cloud');
    if (!tagCloud) return;
    
    // 计算字体大小范围
    const maxCount = Math.max(...tagsData.map(tag => tag.count));
    const minFontSize = 14;
    const maxFontSize = 32;
    
    tagCloud.innerHTML = tagsData.map(tag => {
        // 根据文章数量计算字体大小
        const fontSize = minFontSize + (tag.count / maxCount) * (maxFontSize - minFontSize);
        
        return `
            <a href="#" class="tag-cloud-item" data-tag="${tag.name}" 
               style="font-size: ${fontSize}px;">
                ${tag.name} (${tag.count})
            </a>
        `;
    }).join('');
}

// 渲染标签列表
function renderTagsList(tagsData) {
    const tagsList = document.getElementById('tags-list');
    const totalTags = document.getElementById('total-tags');
    const mostArticlesTag = document.getElementById('most-articles-tag');
    const avgArticles = document.getElementById('avg-articles');
    
    if (!tagsList) return;
    
    // 渲染标签列表
    tagsList.innerHTML = tagsData.map(tag => `
        <li>
            <a href="#" class="tag-list-item" data-tag="${tag.name}">
                <span class="tag-name">${tag.name}</span>
                <span class="tag-count">${tag.count}</span>
            </a>
        </li>
    `).join('');
    
    // 更新统计信息
    if (totalTags) {
        totalTags.textContent = tagsData.length;
    }
    
    if (mostArticlesTag && tagsData.length > 0) {
        mostArticlesTag.textContent = tagsData[0].name;
    }
    
    if (avgArticles && tagsData.length > 0) {
        const avg = tagsData.reduce((sum, tag) => sum + tag.count, 0) / tagsData.length;
        avgArticles.textContent = avg.toFixed(1);
    }
}

// 初始化标签搜索
function initTagSearch() {
    const searchInput = document.getElementById('tag-search-input');
    const searchBtn = document.getElementById('tag-search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim().toLowerCase();
            filterTags(query);
        });
        
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            filterTags(query);
        });
    }
}

// 过滤标签
function filterTags(query) {
    const tagItems = document.querySelectorAll('.tag-list-item, .tag-cloud-item');
    
    tagItems.forEach(item => {
        const tagName = item.dataset.tag.toLowerCase();
        if (query === '' || tagName.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// 初始化标签点击
function initTagClicks() {
    // 标签云点击
    document.addEventListener('click', function(e) {
        const tagElement = e.target.closest('[data-tag]');
        if (tagElement && (tagElement.classList.contains('tag-cloud-item') || 
                           tagElement.classList.contains('tag-list-item'))) {
            e.preventDefault();
            const tagName = tagElement.dataset.tag;
            showTagArticles(tagName);
        }
        
        // 返回所有标签按钮
        const backBtn = e.target.closest('#back-to-all-tags-btn');
        if (backBtn) {
            e.preventDefault();
            showAllTags();
        }
    });
}

// 显示标签文章
function showTagArticles(tagName) {
    const tagsData = generateTagsData();
    const tagData = tagsData.find(tag => tag.name === tagName);
    
    if (!tagData) return;
    
    // 更新UI状态
    document.getElementById('current-tag-title').textContent = `#${tagName}`;
    document.getElementById('tag-articles-count').textContent = `${tagData.count} 篇文章`;
    document.getElementById('no-tag-selected').style.display = 'none';
    document.getElementById('back-to-tags').style.display = 'block';
    
    // 高亮选中的标签
    document.querySelectorAll('[data-tag]').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tag === tagName) {
            item.classList.add('active');
        }
    });
    
    // 渲染标签文章
    const container = document.getElementById('tag-articles-container');
    container.innerHTML = tagData.articles.map(post => createArticleItem(post)).join('');
}

// 显示所有标签
function showAllTags() {
    document.getElementById('current-tag-title').textContent = '选择标签查看文章';
    document.getElementById('tag-articles-count').textContent = '0 篇文章';
    document.getElementById('no-tag-selected').style.display = 'block';
    document.getElementById('back-to-tags').style.display = 'none';
    document.getElementById('tag-articles-container').innerHTML = '';
    
    // 移除标签高亮
    document.querySelectorAll('[data-tag]').forEach(item => {
        item.classList.remove('active');
    });
}

// 文章详情页初始化
function initArticlePage() {
    // 获取文章ID
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = parseInt(urlParams.get('id')) || 1;
    
    // 加载文章
    loadArticle(articleId);
    
    // 初始化交互功能
    initArticleInteractions();
}

// 加载文章
function loadArticle(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) {
        // 文章不存在，跳转到首页
        window.location.href = 'index.html';
        return;
    }
    
    // 更新页面标题
    document.title = `${post.title} | wwz的博客`;
    
    // 更新文章信息
    document.getElementById('article-title').textContent = post.title;
    document.getElementById('article-category').textContent = post.category;
    document.getElementById('article-date').textContent = post.date;
    document.getElementById('article-views').innerHTML = `<i class="far fa-eye"></i> <span>${post.views}</span>`;
    document.getElementById('article-reading-time').innerHTML = `<i class="far fa-clock"></i> <span>${post.readingTime}分钟阅读</span>`;
    document.getElementById('article-image').src = post.image;
    document.getElementById('article-image').alt = post.title;
    document.getElementById('like-count').textContent = post.likes;
    
    // 渲染标签
    const tagsContainer = document.getElementById('article-tags');
    tagsContainer.innerHTML = post.tags.map(tag => 
        `<a href="tags.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`
    ).join('');
    
    // 渲染文章内容
    renderArticleContent(post);
    
    // 生成目录
    generateTableOfContents(post.content);
    
    // 加载相关文章
    loadRelatedArticles(post);
    
    // 更新上一篇/下一篇
    updateArticleNavigation(id);
    
    // 更新文章浏览量（模拟）
    updateArticleViews(id);
}

// 渲染文章内容
function renderArticleContent(post) {
    const contentContainer = document.getElementById('article-body');
    if (!contentContainer) return;
    
    // 使用marked渲染Markdown
    if (typeof marked !== 'undefined') {
        const htmlContent = marked.parse(post.content);
        contentContainer.querySelector('.markdown-content').innerHTML = htmlContent;
        
        // 高亮代码块
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    } else {
        contentContainer.querySelector('.markdown-content').innerHTML = 
            `<p>${post.content}</p>`;
    }
}

// 生成目录
function generateTableOfContents(content) {
    const tocContainer = document.getElementById('table-of-contents');
    if (!tocContainer) return;
    
    // 提取标题
    const headingRegex = /^#{2,4}\s+(.+)$/gm;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[0].match(/^#+/)[0].length;
        const title = match[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
        
        headings.push({
            level: level,
            title: title,
            id: id
        });
    }
    
    if (headings.length === 0) {
        tocContainer.innerHTML = '<p>本文暂无目录</p>';
        return;
    }
    
    // 生成目录HTML
    let tocHTML = '<ul>';
    let currentLevel = 2;
    
    headings.forEach(heading => {
        // 处理层级关系
        if (heading.level > currentLevel) {
            tocHTML += '<ul>';
        } else if (heading.level < currentLevel) {
            tocHTML += '</ul>';
        }
        
        tocHTML += `
            <li>
                <a href="#${heading.id}" data-toc-id="${heading.id}">
                    ${heading.title}
                </a>
            </li>
        `;
        
        currentLevel = heading.level;
    });
    
    // 关闭未闭合的ul标签
    while (currentLevel > 2) {
        tocHTML += '</ul>';
        currentLevel--;
    }
    
    tocHTML += '</ul>';
    tocContainer.innerHTML = tocHTML;
    
    // 为文章中的标题添加ID
    setTimeout(() => {
        const markdownContent = document.querySelector('.markdown-content');
        if (markdownContent) {
            headings.forEach(heading => {
                const headingElement = Array.from(markdownContent.querySelectorAll('h2, h3, h4'))
                    .find(h => h.textContent.trim() === heading.title);
                
                if (headingElement) {
                    headingElement.id = heading.id;
                }
            });
        }
        
        // 目录点击事件
        const tocLinks = tocContainer.querySelectorAll('a');
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }, 100);
}

// 加载相关文章
function loadRelatedArticles(currentPost) {
    const relatedContainer = document.getElementById('related-articles');
    if (!relatedContainer) return;
    
    // 查找相关文章（基于标签匹配）
    const relatedPosts = blogPosts
        .filter(post => post.id !== currentPost.id)
        .map(post => {
            const commonTags = post.tags.filter(tag => 
                currentPost.tags.includes(tag)
            ).length;
            return { post, commonTags };
        })
        .filter(item => item.commonTags > 0)
        .sort((a, b) => b.commonTags - a.commonTags)
        .slice(0, 3)
        .map(item => item.post);
    
    if (relatedPosts.length === 0) {
        // 如果没有相关文章，显示热门文章
        relatedPosts.push(...blogPosts
            .filter(post => post.id !== currentPost.id)
            .sort((a, b) => b.views - a.views)
            .slice(0, 3));
    }
    
    // 渲染相关文章
    relatedContainer.innerHTML = relatedPosts.map(post => `
        <article class="related-card">
            <div class="related-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="related-content">
                <h4 class="related-title">
                    <a href="article.html?id=${post.id}">${post.title}</a>
                </h4>
                <div class="related-meta">
                    <span class="date">${post.date}</span>
                    <span class="views"><i class="far fa-eye"></i> ${post.views}</span>
                </div>
                <p class="related-excerpt">${post.excerpt}</p>
            </div>
        </article>
    `).join('');
}

// 更新文章导航
function updateArticleNavigation(currentId) {
    const currentIndex = blogPosts.findIndex(post => post.id === currentId);
    
    if (currentIndex > 0) {
        const prevPost = blogPosts[currentIndex - 1];
        document.getElementById('prev-article').href = `article.html?id=${prevPost.id}`;
        document.getElementById('prev-title').textContent = prevPost.title;
        document.getElementById('prev-article').style.display = 'flex';
    } else {
        document.getElementById('prev-article').style.display = 'none';
    }
    
    if (currentIndex < blogPosts.length - 1) {
        const nextPost = blogPosts[currentIndex + 1];
        document.getElementById('next-article').href = `article.html?id=${nextPost.id}`;
        document.getElementById('next-title').textContent = nextPost.title;
        document.getElementById('next-article').style.display = 'flex';
    } else {
        document.getElementById('next-article').style.display = 'none';
    }
}

// 更新文章浏览量（模拟）
function updateArticleViews(id) {
    // 在实际应用中，这里应该调用API更新数据库
    const post = blogPosts.find(p => p.id === id);
    if (post) {
        post.views++;
        const viewsElement = document.querySelector(`[data-id="${id}"] .views span, #article-views span`);
        if (viewsElement) {
            viewsElement.textContent = post.views;
        }
    }
}

// 初始化文章交互
function initArticleInteractions() {
    // 点赞功能
    const likeBtn = document.getElementById('like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            const likeCount = document.getElementById('like-count');
            let count = parseInt(likeCount.textContent) || 0;
            count++;
            likeCount.textContent = count;
            
            // 更新按钮状态
            likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span>已点赞</span> <span class="like-count">${count}</span>`;
            likeBtn.classList.add('liked');
            likeBtn.disabled = true;
            
            // 显示动画效果
            likeBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 300);
            
            // 在实际应用中，这里应该调用API保存点赞状态
        });
    }
    
    // 分享功能
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    text: document.querySelector('#article-title').textContent,
                    url: window.location.href
                });
            } else {
                // 复制链接到剪贴板
                navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                        alert('链接已复制到剪贴板！');
                    })
                    .catch(() => {
                        prompt('请手动复制链接：', window.location.href);
                    });
            }
        });
    }
    
    // 收藏功能
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const articleId = new URLSearchParams(window.location.search).get('id');
            
            // 切换收藏状态
            if (this.classList.contains('saved')) {
                this.classList.remove('saved');
                this.innerHTML = '<i class="far fa-bookmark"></i> <span>收藏</span>';
                // 从收藏夹移除
                removeFromFavorites(articleId);
            } else {
                this.classList.add('saved');
                this.innerHTML = '<i class="fas fa-bookmark"></i> <span>已收藏</span>';
                // 添加到收藏夹
                addToFavorites(articleId);
            }
            
            // 动画效果
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 300);
        });
        
        // 检查是否已收藏
        checkFavoriteStatus();
    }
}

// 添加到收藏夹
function addToFavorites(articleId) {
    let favorites = JSON.parse(localStorage.getItem('blog_favorites') || '[]');
    if (!favorites.includes(articleId)) {
        favorites.push(articleId);
        localStorage.setItem('blog_favorites', JSON.stringify(favorites));
    }
}

// 从收藏夹移除
function removeFromFavorites(articleId) {
    let favorites = JSON.parse(localStorage.getItem('blog_favorites') || '[]');
    favorites = favorites.filter(id => id !== articleId);
    localStorage.setItem('blog_favorites', JSON.stringify(favorites));
}

// 检查收藏状态
function checkFavoriteStatus() {
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn) return;
    
    const articleId = new URLSearchParams(window.location.search).get('id');
    const favorites = JSON.parse(localStorage.getItem('blog_favorites') || '[]');
    
    if (favorites.includes(articleId)) {
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> <span>已收藏</span>';
    }
}

// 工具函数：格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}