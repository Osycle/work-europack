






		//Проверка на заполнения полей радио кнопок
		var inputFilledContent = $("[data-input-filled='content']");
		inputFilledContent
			.find("[data-input-filled]:not([data-input-filled='1'])")
			.addClass("not-filled")
			.find("input")
			.attr("disabled", "disabled");

		inputFilledContent.map(function(i, el){
			var currentCnt;
			el = $(el);
			el.find("[data-input-filled] input").on("change", function(){
				if( !this.checked )
					return;
			currentCnt = $(this).closest("[data-input-filled]").attr("data-input-filled")*1;
			var nextInput = el.find("[data-input-filled='"+(++currentCnt)+"']")
			nextInput.removeClass("not-filled").find("input[disabled]").removeAttr("disabled");
			})      
		})


		window.buildpack = {
			packageSelections: {
				value: "",
				desc: ""
			},
			customsize: {},
			paperOptions: {},
			currentData: {
				inputName: "",
				title: "",
				desc: ""
			},
			update: function(){
				var options = $.extend( this.paperOptions, this.currentData );
				//console.log(options);
			},
			appendSummary: function ( container ){
				var containerContent = container || $(".summary-items");
				for( var i in this.currentData  ){
					var content = '<div class="summary-item '+this.currentData[i].inputName+'">'+
													'<span class="summary-title"><b>'+this.currentData[i].title+'</b></span>'+
													'<span class="summary-desc">'+this.currentData[i].desc+'</span>'+
												'</div>';
					if( !containerContent.children().hasClass(this.currentData[i].inputName) )
						containerContent.append( content );
					else
						containerContent.find("."+this.currentData[i].inputName+" .summary-desc").text(this.currentData[i].desc);
				}

			},
			clearSummary: function( container ){
				var containerContent = container || $(".summary-items");
				$(".summary-items").text("");
			},
			clear: function(){
				this.paperOptions = {};
				this.currentData = {};
				this.customsize = {};
				this.clearSummary();
				$(".buildpack-form")[0].reset();
			},
			dataInputConverter: function(self){
				if( typeof self.attr("data-input") != "undefined" )
						this.currentData = JSON.parse( self.attr("data-input") );
				else
					console.error("Нужны параметры в атрибуте data-input");
		

			},
			/*Поиск картины*/
			changeImage: function(){


				var paper = (buildpack.paperOptions.paper) ? this.paperOptions.paper.value : null;
				var handle = (buildpack.paperOptions.handle) ? this.paperOptions.handle.value : null;
				var size = (buildpack.paperOptions.size) ? this.paperOptions.size.value : null;
				var craftPackage = [paper, handle, size];
				var imgName = "";


				craftPackage = craftPackage.filter(function(arr) {
					return arr !== undefined && arr !== null; 
				});
				for (var i = 0; i < craftPackage.length; i++) {
					i != 0 ? imgName += "-"+craftPackage[i] : imgName += craftPackage[i];
				}
				/*Нахождение индекса элемента карусели картинки*/
				var index = $(".tab-pane.active [data-buildpack-image*='"+imgName+"']").eq(0).index();
				buildpackCarousel.flickity( 'select', index );
			}


		}


		$("[data-buildpack-event='radio']").on("change", function(){
			var self = $(this);


			buildpack.dataInputConverter(self);
			buildpack.update();
			buildpack.appendSummary();

			if( buildpack.currentData.paper || buildpack.currentData.handle || buildpack.currentData.size)
				buildpack.changeImage();

		})



 		
		$("[data-buildpack-event='num']").on("change", function(){
			var self = $(this);
				if( isNaN(self.val()*1) ){
					self.val("");
					return;
				}

				buildpack.dataInputConverter(self);
				buildpack.update();
				
				editionField(self);
				customsizeField(self);

				buildpack.appendSummary();
		})

		$("[data-buildpack-event='text']").on("change", function(){
			var self = $(this);
			buildpack.dataInputConverter(self);
			buildpack.update();
			for(var i in buildpack.currentData ){
				buildpack.currentData[i].value = self.val();	
				buildpack.currentData[i].desc = self.val();	
				if( !("visible" in buildpack.currentData[i]) && buildpack.currentData[i].visible != "hidden")
					buildpack.appendSummary();
					
			}
			
		})

		/*Клик навигаций buildpack*/
		$(".buildpack-nav").on("click", "[data-toggle='tab']", function(){
			var s = $(this).closest(".boxes-cell").addClass("active").siblings().removeClass("active");
			setTimeout(function(){
				buildpack.clear();
			}, 300)
		})

		/*Клик по кнопке заказать расчёт*/
		$("[data-src='#ordercalc']").on("click", function(){
			var self = $(this);
			var descContent = "";
			var inputContent = ""
			for(var i in buildpack.paperOptions ){
				if ( !(buildpack.paperOptions[i].visible == "hidden") ){
				 	descContent += 
					 	'<tr>'+
			        '<td>'+buildpack.paperOptions[i].title+'</td>'+
			        '<td>'+buildpack.paperOptions[i].desc+'</td>'+
			      '</tr>';
				}

			    inputContent += 
			    '<input class="modal-control" type="text" '+
			    			'name="'+i+'" '+
			    			'value="'+buildpack.paperOptions[i].value+'" '+
			    			'placeholder="'+buildpack.paperOptions[i].title+'">';
			}
			var buildpackBlock = $(".buildpack-block.active");
			buildpack.packageSelections.value = buildpackBlock.attr("data-buildpack-value");
			buildpack.packageSelections.desc = buildpackBlock.attr("data-buildpack-desc");
			
			
			$(".buildpack-block .active").attr("data-buildpack-desc")

			/*Имя инпута формы раздела таба*/
			inputContent += '<input class="modal-control" type="text" name="buildpack" value="'+buildpack.packageSelections.value+'">';
			inputContent += '<input class="modal-control" type="text" name="buildpack-desc" value="'+buildpack.packageSelections.desc+'">';
			/*Вставка изображение*/
			var bg = self.closest(".buildpack-summary").find(".buildpack-summary-img .is-selected .img").attr("style");
			$("#summary-info .img").attr("style", bg);

			/*Очитка и вставка от предыдущих значении в резюмировании товара*/
			$("#ordercalc .desc-content table tbody").text("").append(descContent);
			$("#ordercalc form #field-hidden").text("").append(inputContent);
		})
		

		/*Убираем отметку на фиксированных размеров и наобарот*/
		window.checkedToggle = function( checkedInput, valueInput, status ){
				if( status ){
					if( $(checkedInput+":checked").length != 0){
						$(valueInput).val("");
					}
				}else{
					if( $(checkedInput+":checked").length != 0){
						$(checkedInput+":checked")[0].checked = false;
					}
				}
			
		}

		
		function customsizeField (self){
			if( !self.filter("[name*='-customsize']").length )
				return;
			var customsize = buildpack.customsize;
			var height = self.filter("[data-size-field='height']").val();
			var width = self.filter("[data-size-field='width']").val();
			var weight = self.filter("[data-size-field='weight']").val();

			var customsizeValue = "";

			customsize.height = height || customsize.height || "_";
			customsize.width = width || customsize.width || "_";
			if( !$(self).closest(".field-customsize.field-2").length )
				customsize.weight = weight || customsize.weight || "_";

			var cnt = 0;
			for( var i in customsize ){
				//if(  )
				customsizeValue += (cnt != 0) ? "x"+customsize[i] : customsize[i];
				cnt++;
			}


			buildpack.currentData.size.desc = customsizeValue;
			buildpack.currentData.size.value = customsizeValue;
		}

		function editionField(self){
			if( !self.filter("[name*='-edition']").length )
				return;
			if( self.filter("[data-input-value-min]").length ){
				var min = self.attr("data-input-value-min");
				if( self.val() < min*1 ) self.val(min);
			}
			buildpack.currentData.edition.desc = self.val();
			buildpack.currentData.edition.value = self.val();
		
		}







